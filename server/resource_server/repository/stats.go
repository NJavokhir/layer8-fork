package repository

import (
	"context"
	"fmt"
	"globe-and-citizen/layer8/server/resource_server/models"
	"strconv"
	"time"

	influxdb2 "github.com/influxdata/influxdb-client-go/v2"
)

type StatRepository struct {
	influxDBClient influxdb2.Client
}

func NewStatRepository(
	influxDBClient influxdb2.Client,
) *StatRepository {
	return &StatRepository{
		influxDBClient: influxDBClient,
	}
}

func (s *StatRepository) GetTotalRequestsInLastXDays(ctx context.Context, days int) (models.Statistics, error) {
	result := make([]models.UsageStatisticPerDate, 0)

	queryAPI := s.influxDBClient.QueryAPI("layer8")

	query := fmt.Sprintf(`from(bucket: "layer8")
	|> range(start: -%dd)
	|> filter(fn: (r) => r["_measurement"] == "total_byte_transferred")
	|> filter(fn: (r) => r["_field"] == "counter")
	|> aggregateWindow(every: 1d, fn: sum, createEmpty: true)
	|> yield(name: "sum")`, days)

	rawDataFromInflux, err := queryAPI.Query(context.Background(), query)
	if err != nil {
		return models.Statistics{}, err
	}

	var totalRequest float64
	for rawDataFromInflux.Next() {
		rawDataPointer := rawDataFromInflux.Record()
		unparsedTotal := rawDataPointer.ValueByKey("_value")
		decimalValueTotal, err := strconv.ParseFloat(fmt.Sprint(unparsedTotal), 64)
		if err != nil {
			decimalValueTotal = 0
		}

		totalRequest += decimalValueTotal / 1000000000

		at := rawDataPointer.ValueByKey("_time").(time.Time)
		result = append(result, models.UsageStatisticPerDate{
			Date:  at.Format("Mon, 02 Jan 2006"),
			Total: decimalValueTotal / 1000000000,
		})
	}

	averageRequest := totalRequest / float64(len(result))

	return models.Statistics{
		Total:            totalRequest,
		Average:          averageRequest,
		StatisticDetails: result,
	}, nil
}

func (s *StatRepository) GetTotalByDateRange(ctx context.Context, start time.Time, end time.Time) (float64, error) {
	queryAPI := s.influxDBClient.QueryAPI("layer8")

	query := fmt.Sprintf(`
	from(bucket: "layer8")
	|> range(start: %s, stop: %s)
	|> filter(fn: (r) => r["_measurement"] == "total_byte_transferred")
	|> filter(fn: (r) => r["_field"] == "counter")
	|> sum()`, start.Format(time.RFC3339), end.Format(time.RFC3339))

	rawDataFromInflux, err := queryAPI.Query(context.Background(), query)
	if err != nil {
		return 0, err
	}

	var decimalValueTotal float64
	for rawDataFromInflux.Next() {
		rawDataPointer := rawDataFromInflux.Record()
		unparsedTotal := rawDataPointer.ValueByKey("_value")
		decimalValueTotal, err = strconv.ParseFloat(fmt.Sprint(unparsedTotal), 64)
		if err != nil {
			decimalValueTotal = 0
		}
	}

	return decimalValueTotal, err
}
