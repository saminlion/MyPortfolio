import { CubismModelSettingJson } from 'live2d/cubismmodelsettingjson'
import { CubismUserModel } from 'live2d/model/cubismusermodel'
import { CubismMatrix44 } from 'live2d/math/cubismmatrix44';
import { CubismRenderer_WebGL } from 'live2d/rendering/cubismrenderer_webgl';
import { CubismMoc } from '../../Framework/src/model/cubismmoc';

export class LAppModel extends CubismUserModel {
    constructor(gl) {
      super();
      this.gl = gl;
      this._modelSetting = null;
      this._modelHomeDir = '';
      this._modelMatrix = new CubismMatrix44();
      this._renderer = new CubismRenderer_WebGL();
      this._moc = null;
    }
  
    async loadAssets(dir, fileName) {
      try {
        const response = await fetch(`${dir}${fileName}`);
        const arrayBuffer = await response.arrayBuffer();
  
        const setting = new CubismModelSettingJson(arrayBuffer, arrayBuffer.byteLength);
        this.setupModel(setting, dir);
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
      for (let i = 0; i < textureCount; i++) {
        const textureFileName = this._modelSetting.getTextureFileName(i);
        const texturePath = `${dir}${textureFileName}`;
        await this.loadTexture(i, texturePath);
      }
    }
  
    async loadTexture(index, texturePath) {
      const img = new Image();
  
      await new Promise((resolve, reject) => {
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
          this._renderer.bindTexture(index, tex);
  
          resolve();
        };
        img.onerror = reject;
      });
  
      this._renderer.setIsPremultipliedAlpha(true);
    }
  
    update() {
      if (this._model) {
        this._model.update();
      }
    }
  
    draw(projection) {
      if (this._model) {
        projection.scale(1, window.innerWidth / window.innerHeight);
        projection.multiplyByMatrix(this._modelMatrix);
  
        this._renderer.initialize();
        this._renderer.startUp(this.gl);

        this._renderer.setMvpMatrix(projection);
        this._renderer.drawModel();
      }
    }
  }
  