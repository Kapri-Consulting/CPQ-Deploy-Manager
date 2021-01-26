import { posix } from 'path';
import { TextEncoder } from 'util';
import * as vscode from 'vscode';

export class CpqService {
    private baseUrl: string = "";
    

    /**
     * Initializes CpqService object
     */
    constructor() {
        this.baseUrl = vscode.workspace.getConfiguration().get("cpq.url") || '';
    }
    
    /**
     * GetBearerToken: Gets bearer token for login
     */
    private GetBearerToken(callback: any) {
        let tokenUrl: string = vscode.workspace.getConfiguration().get("token.url") || '';
        let username: string = vscode.workspace.getConfiguration().get("cpq.username") || '';
        let password: string = vscode.workspace.getConfiguration().get("cpq.password") || '';
        let domain: string = vscode.workspace.getConfiguration().get("cpq.domain") || '';
        var request = require('request');
        var options = {
            'method': 'POST',
            'url': this.baseUrl + tokenUrl,
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            form: {
                'grant_type': 'password',
                'username': username,
                'password': password,
                'domain': domain
        }
        };
        request(options, function (error: string | undefined, response: { body: any; }) { 
            if (error) {throw new Error(error);}
                callback(response.body);
        });
    }

    /**
     * PostScript: Adds script to CPQ environment
     */
    postScript() {
        this.GetBearerToken((data: any) => {


            async function countAndTotalOfFilesInFolder(folder: vscode.Uri, rootName: string) {
                const filePath = posix.join(folder.path, rootName);
                for (const [name, type] of await vscode.workspace.fs.readDirectory(folder)) {
                    if (type === vscode.FileType.Directory) {
                        const filePath = posix.join(folder.path, name);
                        const stat = await vscode.workspace.fs.stat(folder.with({ path: filePath }));;
                        if(rootName === name){
                            console.log(filePath);
                            return true;
                        }
                        
                    }
                }
                //vscode.Uri.parse(filePath);
                vscode.workspace.fs.createDirectory(vscode.Uri.parse(filePath));
                
            }

            vscode.window.showInformationMessage(data);
            let currentFolderName: string = "";
            let scriptUrl: string = "";
            let customActionsUrl: string = "";

            if (vscode.workspace.workspaceFolders !== undefined) {
                const folderPath = vscode.workspace.workspaceFolders[0].uri;
                const currentFolder = vscode.workspace.getWorkspaceFolder(folderPath);
                countAndTotalOfFilesInFolder(folderPath,"GlobalScripts");
                countAndTotalOfFilesInFolder(folderPath,"CustomActions");
                currentFolderName = currentFolder?.name || '';
            }
            else{
                let error: Error = new Error("Please define folder structure");
                console.log(error.message);
                throw error;
            }
            scriptUrl = vscode.workspace.getConfiguration().get("globalScript.url") || '';
            customActionsUrl = vscode.workspace.getConfiguration().get("customActions.url") || '';
            /*if (currentFolderName === "GlobalScripts") {
                scriptUrl = vscode.workspace.getConfiguration().get("globalScript.url") || '';
            }else if (currentFolderName === "CustomActions") {
                scriptUrl = vscode.workspace.getConfiguration().get("customAction.url") || '';
            }*/

            let jsonResp = JSON.parse(data);
            let request = require('request');
            /*var options = {
                'method': 'Get',
                'url': this.baseUrl + scriptUrl,
                'headers': {
                    'Authorization': 'Bearer ' + jsonResp.access_token,
                    'Content-Type': 'application/json'
                }
                    };
            request(options, function (error: string | undefined, response: { body: any, statuscode: any }) {
                if (error) {
                    throw new Error(error);
                }
                vscode.window.showInformationMessage(response.statuscode);
                console.log(response.body);
                var scripts = JSON.parse(response.body);
                scripts.pagedRecords.forEach(async function (value: any) {
                    
                    
                    console.log(value);
                        if (!vscode.workspace.workspaceFolders) {
                            return vscode.window.showInformationMessage('No folder or workspace opened');
                        }
                        const writeStr = "''' \nid:" + JSON.stringify(value.scriptDefinition.id) + "'''" + '\n' + value.scriptDefinition.script;
                        const writeData = Buffer.from(writeStr, 'utf8');
                        const folderUri = vscode.workspace.workspaceFolders[0].uri;
                        const fileUri = folderUri.with({ path: posix.join(folderUri.path + "/GlobalScripts", value.scriptDefinition.name + "_" + value.scriptDefinition.id + ".py") });
                        await vscode.workspace.fs.writeFile(fileUri, writeData);
                });
            });*/

            let options = {
                'method': 'Get',
                'url': this.baseUrl + customActionsUrl,
                'headers': {
                    'Authorization': 'Bearer ' + jsonResp.access_token,
                    'Content-Type': 'application/json'
                }
                    };
            request(options, function (error: string | undefined, response: { body: any, statuscode: any }) {
                if (error) {
                    throw new Error(error);
                }
                vscode.window.showInformationMessage(response.statuscode);
                console.log(response.body);
                var scripts = JSON.parse(response.body);
                scripts.pagedRecords.forEach(async function (value: any) {
                    
                    
                    console.log(value);
                        if (!vscode.workspace.workspaceFolders) {
                            return vscode.window.showInformationMessage('No folder or workspace opened');
                        }
                        const writeStr = "''' \nid:" + JSON.stringify(value.scriptDefinition.id) + "'''" + '\n' + value.scriptDefinition.script;
                        const writeData = Buffer.from(writeStr, 'utf8');
                        const folderUri = vscode.workspace.workspaceFolders[0].uri;
                        const fileUri = folderUri.with({ path: posix.join(folderUri.path + "/CustomActions", value.scriptDefinition.name + "_" + value.scriptDefinition.id + ".py") });
                        await vscode.workspace.fs.writeFile(fileUri, writeData);
                });
            });
        });
    }
}