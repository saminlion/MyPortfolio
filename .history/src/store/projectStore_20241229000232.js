import { defineStore } from "pinia";
import { reactive } from "vue";

export const useProjectStore = defineStore("project", {
    state: () =>
        reactive({
            id: 0,
            project: null
        }),
    actions: {
        setProject(id, project) {
            console.log("Previous id:", this.id);
            console.log("Updated project:", this.project);

            this.id = id;
            this.project = project;

            console.log("Updated id:", this.id);
            console.log("Updated project:", this.project);
        }
    }
});