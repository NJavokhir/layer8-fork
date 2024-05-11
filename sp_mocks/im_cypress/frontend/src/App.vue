<script setup>
import {ref} from "vue"
import layer8_interceptor from 'layer8_interceptor'

let persistenceCounter = ref(0)
async function persistenceCheck(){
  persistenceCounter.value = await layer8_interceptor.persistenceCheck();
  console.log(persistenceCounter.value)
}

let tunnelFlag = ref(false)
async function openEncryptedTunnel(){
  try{
    layer8_interceptor.initEncryptedTunnel({
      providers: ["http://localhost:8001"],
      proxy: "http://localhost:5001" 
    }, "dev")
    tunnelFlag.value = true
  }catch(err){
    console.log(".initEncryptedTunnel error: ", err)
  }
}

async function checkEncryptedTunnel(){
  return await layer8_interceptor.checkEncryptedTunnel()
}

let textResp = ref("")
async function simpleGET(){
  const response = await layer8_interceptor.fetch("http://localhost:8001/nextjson")
  let jsonResp = await response.json()
  textResp.value = await JSON.stringify(jsonResp)
  console.log(textResp.value)
}

let echoResp = ref("")
async function simplePOST(){
  const response = await layer8_interceptor.fetch("http://localhost:8001/echo", {
      method: "POST",
      headers: {
        "Content-Type": "Application/Json",
      },
      body: JSON.stringify({"message":"layer8"}),
    }) 

  let jsonResp = await response.json()
  echoResp.value = await JSON.stringify(jsonResp)
  console.log(echoResp.value)
}

let image = ref(null);
let isLoading = ref(false);
let returnedURL = ref("")
async function uploadImage(e) {
  console.log("arrived")
  e.preventDefault();
  isLoading.value = true;
  const file = e.target.files[0];
  const formdata = new FormData();
  formdata.append("file", file);
  layer8_interceptor.fetch("http://localhost:8001/imageupload", {
    method: "POST",
    headers: {
      "Content-Type": "multipart/form-data",
    },
    body: formdata,
  })
    .then((res) => res.json())
    .then(async (data) => {
      image.value = data.url;
      const url = await layer8_interceptor.static(data.url);
      const element = document.getElementById("image");
      element.src = url;
      returnedURL.value = url;
    })
    .catch((err) => console.log("image upload err: ", err))
    .finally(() => {
      isLoading.value = false;
    });
};



</script>

<template>
  <h1>Layer8 Interceptor & Middleware Test Suite</h1>

  <div>
    <h3>Check WASM Loaded</h3>
    <div><button @click="persistenceCheck" data-cy="persistence-check-btn">Click</button></div>
    <div> Result: <span data-cy="persistence-check-counter"> {{persistenceCounter}}</span></div>
  </div>
  <hr>

  <div>
    <h3>Initiate Tunnel</h3>
    <div><button @click="openEncryptedTunnel" data-cy="open-encrypted-tunnel-btn">Click</button></div>
    <div> Result: <span data-cy="open-tunnel-flag">{{tunnelFlag}}</span></div>
  </div>
  <hr>

  <div>
    <h3>Simple GET</h3>
    <div><button @click="simpleGET" data-cy="simple-get-btn">Click</button></div>
    <div> Result: <span data-cy="simple-get-response">{{textResp}}</span></div>
  </div>
  <hr>

  <div>
    <h3>Simple POST</h3>
    <div><button @click="simplePOST" data-cy="simple-post-btn">Click</button></div>
    <div> Result: <span data-cy="simple-post-response">{{echoResp}}</span></div>
  </div>
  <hr>

  <div>
    <h3>Upload Image</h3>
    <div><input type="file" @change="uploadImage"/></div>
    <div data-cy="upload-image-result">
      <img  id="image"/>
      <p>URL: {{returnedURL}}</p>
    </div>
  </div>
  <hr>

</template>

<style scoped>

</style>
