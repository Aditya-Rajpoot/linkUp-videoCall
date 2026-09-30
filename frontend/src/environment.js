let IS_PROD = true;
const server = IS_PROD ?
    "https://link-up-video-call-ljwv.vercel.app" :
    "http://localhost:8000"

export default server;