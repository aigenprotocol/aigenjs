import 'dotenv/config'
import {createAINFTs} from "./create_ainfts.js"
import {downloadAINFTs} from "./download_ainfts.js"
import {createAIProject} from "./create_aiproject.js";
import {slugify} from "./utils.js";

let action = process.env.npm_config_action
let projectId = process.env.npm_config_project_id
let projectName = process.env.npm_config_project_name
let projectDescription = process.env.npm_config_project_description
let projectLogoPath = process.env.npm_config_project_logo_path
let projectBannerPath = process.env.npm_config_project_banner_path

projectName = slugify(projectName)

if (action === "createAIProject") {
    createAIProject(projectName, projectDescription, projectLogoPath, projectBannerPath).then(status => {
        if (status) {
            console.log("All AINFTs created successfully!!!")
        }
    })
} else if (action === "createAINFTs") {
    createAINFTs(projectId, projectName).then(status => {
        if (status) {
            console.log("All AINFTs created successfully!!!")
        }
    })
} else if (action === "downloadAINFT") {
    downloadAINFTs(projectId, projectName).then(() => {
    })
} else {
    console.log("Invalid action!")
}
