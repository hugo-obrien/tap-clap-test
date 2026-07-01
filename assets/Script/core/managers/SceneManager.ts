export enum SceneName {
    TOWN_HALL = 0,
    MINE = 1,
    BUILD_MODE = 2
}

export class SceneManager {
    private static _instance: SceneManager;

    public static get instance(): SceneManager {
        if (!this._instance) {
            this._instance = new SceneManager();
        }
        return this._instance;
    }

    private _isLoading: boolean = false;

    private readonly SCENE_MAP: {[key: number]: string} = {
        [SceneName.TOWN_HALL]: 'TownHall',
        [SceneName.MINE]: 'Mine',
        [SceneName.BUILD_MODE]: 'BuildMode'
    }

    public loadScene(sceneName: SceneName) {
        if (this._isLoading) {
            cc.warn('SceneManager.loadScene(): Scene is already loading');
            return;
        }

        const sceneString = this.SCENE_MAP[sceneName];
        if (!sceneString) {
            cc.error(`SceneManager.loadScene(): Scene for ${sceneString} not found`);
            return;
        }

        this._isLoading = true;

        cc.director.loadScene(sceneString, () => {
            this._isLoading = false;
        })
    }
}