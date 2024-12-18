import { CubismModelSettingJson } from 'live2d/cubismmodelsettingjson';
import { CubismMatrix44 } from 'live2d/math/cubismmatrix44';
import { CubismRenderer_WebGL } from 'live2d/rendering/cubismrenderer_webgl';
import { CubismMoc } from 'live2d/model/cubismmoc';
import { CubismMotion } from 'live2d/motion/cubismmotion';
import { CubismMotionManager } from 'live2d/motion/cubismmotionmanager'
import { Live2DCubismFramework as live2dcubismframework, Option as Csm_Option, LogLevel } from 'live2d/live2dcubismframework';
import { csmVector } from 'live2d/type/csmvector';

export class Live2DLoader {

    constructor(canvas, modelPath, modelDirectory, motionPath, motionName,) {
        this.canvas = canvas;
        this.gl = this.canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true });
        this.modelPath = modelPath;
        this.modelDirectory = modelDirectory;
        this.cubismModel = null;
        this.renderer = null;
        this.mousePosition = { x: 0, y: 0 }; // 마우스 위치 저장

        this.motionPath = motionPath
        this.motionName = motionName
        this.motionManager = new CubismMotionManager();
        this.motionUpdated = null;
        this.eyeblinkIds = [];
        this.lipSyncIds =[];
    }

    initFramework() {
        const cubismOption = new Csm_Option();
        cubismOption.logFunction = console.log;
        cubismOption.loggingLevel = LogLevel.LogLevel_Verbose;

        if (!live2dcubismframework.CubismFramework.isStarted()) {
            const initialized = live2dcubismframework.CubismFramework.startUp(cubismOption);
            if (!initialized) throw new Error('Failed to start Live2D Framework');
            live2dcubismframework.CubismFramework.initialize();
        }
    }

    async loadLive2DModel() {
        try {

            this.initFramework();

            // const modelHomeDir = '/Model/Wanko/';
            // const modelSettingPath = modelHomeDir + 'Wanko.model3.json';

            // 모델 설정 파일 로드
            const response = await fetch(this.modelPath);
            console.log('model response:', response);
            const arrayBuffer = await response.arrayBuffer();
            const modelSetting = new CubismModelSettingJson(arrayBuffer, arrayBuffer.byteLength);

            const modelFileName = modelSetting.getModelFileName();
            const modelFilePath = this.modelDirectory + modelFileName;
            const modelFileResponse = await fetch(modelFilePath);
            const modelFileBuffer = await modelFileResponse.arrayBuffer();

            // CubismMoc 생성
            const moc = CubismMoc.create(modelFileBuffer);
            if (!moc) throw new Error('Failed to create CubismMoc');

            this.cubismModel = moc.createModel();
            if (!this.cubismModel) throw new Error('Failed to create CubismModel');

            console.log('CubismModel initialized:', this.cubismModel);

            // EyeBlink 및 LipSync 파라미터 설정
            // this.setupEyeBlinkIds(modelSetting);
            // this.setupLipSyncIds(modelSetting);

            await this.setupRenderer(modelSetting);

            await this.loadLive2DMotion();

        } catch (error) {
            console.error('Failed to load Live2D model:', error);
        }
    }

    async loadLive2DMotion() {
        try {
            const motionFilePath = `${this.motionPath}/${this.motionName}.motion3.json`;

            const response = await fetch(motionFilePath);
            if (!response.ok) throw new Error(`Failed to load motion file: ${response.statusText}`);

            console.log('motionResponse:', response);

            const arrayBuffer = await response.arrayBuffer();

            const motion = CubismMotion.create(arrayBuffer, arrayBuffer.byteLength);

            if (!motion) throw new Error('Failed to create motion. Motion data might be invalid.');

            //motion.setEffectIds(this.eyeBlinkIds, this.lipSyncIds);
            motion.setFadeInTime(1.0);
            motion.setFadeOutTime(1.0);
            motion.setIsLoop(true);

            console.log('Motion Loaded:', motion);

            // 모션 관리 클래스 초기화 및 재생
            if (!this.motionManager) {
                this.motionManager = new CubismMotionManager();
            }

            const motionHandle = this.motionManager.startMotionPriority(motion, true, 2);
            if (motionHandle === -1) {
                throw new Error('Failed to start motion. Invalid motion handle.');
            }

            if (motionHandle === -1) {
                console.error('Failed to start motion: Invalid handle.');
            }

            let time = 1 / 60;
            this.motionUpdated = this.motionManager.updateMotion(this.cubismModel, time);
        }
        catch (error) {
            console.error('Failed to load Live2D motion:', error);
        }
    }

    async setupRenderer(modelSetting) {

        const textures = [];
        for (let i = 0; i < modelSetting.getTextureCount(); i++) {
            const texturePath = this.modelDirectory + modelSetting.getTextureFileName(i);
            const texture = await this.loadTexture(this.gl, texturePath);
            textures.push(texture);
        }
        console.log('Loaded Textures:', textures);

        

        this.renderer = new CubismRenderer_WebGL();
        this.renderer.initialize(this.cubismModel);
        this.renderer.startUp(this.gl);

        this.renderer.setIsPremultipliedAlpha(true);

        console.log('Clipping Context Initialized:', this.renderer._clippingManager); // 추가 디버그

        const scale = 4.0; // 모델의 스케일 값 설정 (큰 값 그대로 유지)
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        const aspectRatio = canvasWidth / canvasHeight;

        const projection = new CubismMatrix44();
        projection.loadIdentity(); // 초기화
        projection.scale(scale, scale * aspectRatio);
        this.renderer.setMvpMatrix(projection);

        // 렌더링 루프 시작
        this.startRenderingLoop(textures);
    }

    async loadTexture(gl, texturePath) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const texture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
                // 안티앨리어싱 적용
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.generateMipmap(gl.TEXTURE_2D);

                gl.bindTexture(gl.TEXTURE_2D, null);
                resolve(texture);
            };
            img.onerror = () => {
                reject(new Error(`Failed to load texture at ${texturePath}`));
            };            img.src = texturePath;
        });
    }

    startRenderingLoop(textures) {
        const render = () => {
            this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);

            for (let i = 0; i < textures.length; i++) {
                this.renderer.bindTexture(i, textures[i]);
            }

            if (this.cubismModel) {
            // 클리핑 매니저 디버깅
            console.log('Clipping Manager State:', this.renderer._clippingManager);

            try {
                this.updateModelParameters();

                this.cubismModel.update();
                this.renderer.drawModel();
            } catch (error) {
                console.error('Error during model rendering:', error);
            }
            }
            requestAnimationFrame(render);
        };

        render();
    }

    setupEyeBlinkIds(modelSetting) {
        const eyeBlinkCount = modelSetting.getEyeBlinkParameterCount();
        console.log('EyeBlink parameter count:', eyeBlinkCount);

        for (let i = 0; i < eyeBlinkCount; i++) {
            const id = modelSetting.getEyeBlinkParameterId(i);
                   console.log(`Adding EyeBlink ID: ${id}`);
                this.eyeBlinkIds.push(id);
        }
        console.log('EyeBlink IDs:', this.eyeBlinkIds);
    }

    setupLipSyncIds(modelSetting) {
        const lipSyncCount = modelSetting.getLipSyncParameterCount();
        for (let i = 0; i < lipSyncCount; i++) {
            const id = modelSetting.getLipSyncParameterId(i);
            this.lipSyncIds.push(id);
        }
        console.log('LipSync IDs:', this.lipSyncIds);
    }

    updateModel(deltaTime) {
        if (!this.cubismModel || !this.motionManager) return;

        try {
            const motionUpdated = this.motionManager.updateMotion(this.cubismModel, deltaTime);
            if (!motionUpdated) {
                // console.warn('No motion updates were applied.');
            } else {
                //console.log('Motion updated successfully.');
            }

            this.cubismModel.update();
        } catch (error) {
            // console.error('Error updating motion:', error);
        }
    }

    updateModelParameters() {
        if (!this.cubismModel) return;

        const { x, y } = this.mousePosition;

        this.cubismModel.setParameterValueByIndex(
            0,
            x * 30
        );
        this.cubismModel.setParameterValueByIndex(
            1,
            y * 30
        );
        this.cubismModel.setParameterValueByIndex(
            2,
            x * y * -10
        );
    }

    updateMousePosition(x, y) {
        this.mousePosition.x = x;
        this.mousePosition.y = y;
    }
}