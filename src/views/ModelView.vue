<template>
    <div>
        <h1>Model View</h1>
        <canvas id="live2d-canvas" class="live2d"></canvas>
    </div>
</template>

<script>
import {Live2DLoader} from '../utils/live2dLoader.js'

export default {
    name: 'Live2DView',

    data() {
        return {
            live2dLoader: null,
        };
    },
    methods: {

    },
    mounted() {
        const canvas = document.getElementById('live2d-canvas');
        const modelPath = '/Model/Wanko/Wanko.model3.json';
        const modelDirectory = '/Model/Wanko/';

        this.live2DLoader = new Live2DLoader(canvas, modelPath, modelDirectory);
        this.live2DLoader.loadLive2DModel();
    },
};
</script>

<style scoped>
.live2d {
    border: 1px solid #ccc;
    display: block;
    margin: auto;
    background-color: rgba(0, 0, 0, 0);
    width: 600px;
    height: 400px;
}
</style>
