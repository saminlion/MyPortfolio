import { CubismModelSettingJson } from 'live2d/cubismmodelsettingjson';
import { CubismUserModel } from 'live2d/model/cubismusermodel';
import { CubismMatrix44 } from 'live2d/math/cubismmatrix44';
import { CubismRenderer_WebGL } from 'live2d/rendering/cubismrenderer_webgl';
import { CubismMoc } from 'live2d/model/cubismmoc';

export class LAppModel extends CubismUserModel {
    constructor(gl) {
        super();
        this.gl = gl;
        this._modelSetting = null;
        this._modelHomeDir = '';
        this._renderer = new CubismRenderer_WebGL();
        this._moc = null;
        this._textures = [];
        this._projection = new CubismMatrix44();
    }

    async loadAssets(dir, fileName) {
        try {
            const response = await fetch(`${dir}${fileName}`);
            console.log('response:', response);
            const arrayBuffer = await response.arrayBuffer();

            const setting = new CubismModelSettingJson(arrayBuffer, arrayBuffer.byteLength);
            await this.setupModel(setting, dir);
        } catch (error) {
            console.error('Failed to load assets:', error);
        }
    }

    async setupModel(setting, dir) {
        this._modelSetting = setting;
        this._modelHomeDir = dir;

        // Load model
        const modelFileName = setting.getModelFileName();
        const modelResponse = await fetch(`${dir}${modelFileName}`);
        const modelBuffer = await modelResponse.arrayBuffer();

        this._moc = CubismMoc.create(modelBuffer);
        if (!this._moc) {
            console.error('Failed to create CubismMoc.');
            return;
        }

        this._model = this._moc.createModel();
        if (!this._model) {
            console.error('Failed to create CubismModel.');
            return;
        }

        // Load textures
        const textureCount = this._modelSetting.getTextureCount();
        const texturePromises = [];
        for (let i = 0; i < textureCount; i++) {
            const textureFileName = this._modelSetting.getTextureFileName(i);
            const texturePath = `${dir}${textureFileName}`;
            texturePromises.push(this.loadTexture(i, texturePath));
        }

        await Promise.all(texturePromises);

        this._renderer.initialize(this._model);
        this._renderer.startUp(this.gl);
        this._renderer.setIsPremultipliedAlpha(true);

        console.log('Model and textures loaded successfully.');
    }

    async loadTexture(index, texturePath) {
        return new Promise((resolve, reject) => {
            const img = new Image();

            img.onload = () => {
                const tex = this.gl.createTexture();
                this.gl.bindTexture(this.gl.TEXTURE_2D, tex);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
                this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);

                this.gl.texImage2D(
                    this.gl.TEXTURE_2D,
                    0,
                    this.gl.RGBA,
                    this.gl.RGBA,
                    this.gl.UNSIGNED_BYTE,
                    img
                );

                this.gl.generateMipmap(this.gl.TEXTURE_2D);
                this._textures[index] = tex;

                resolve();
            };

            img.onerror = () => reject(new Error(`Failed to load texture: ${texturePath}`));
            img.src = texturePath;
        });
    }

    startRenderingLoop() {
        const render = () => {
            this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);

            for (let i = 0; i < this._textures.length; i++) {
                this._renderer.bindTexture(i, this._textures[i]);
            }

            if (this._model) {
                this.updateModelParameters();
                this._model.update();
                this._renderer.setMvpMatrix(this._projection);
                this._renderer.drawModel();
            }

            requestAnimationFrame(render);
        };

        render();
    }

    updateModelParameters() {
        const now = Date.now() / 1000;

        // Simple animation example
        const parameterCount = this._model.parameters.count;
        for (let i = 0; i < parameterCount; i++) {
            const value = Math.sin(now * (i + 1));
            this._model.setParameterValueByIndex(i, value);
        }
    }

    resizeCanvas(canvasWidth, canvasHeight) {
        const aspectRatio = canvasWidth / canvasHeight;
        this._projection.loadIdentity();
        this._projection.scale(1, aspectRatio);
    }
}