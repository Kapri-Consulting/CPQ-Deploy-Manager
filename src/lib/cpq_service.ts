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

            vscode.window.showInformationMessage(data);
            let currentFolderName: string = "";
            let scriptUrl: string = "";

            if (vscode.workspace.workspaceFolders !== undefined) {
                const folderPath = vscode.workspace.workspaceFolders[0].uri;
                const currentFolder = vscode.workspace.getWorkspaceFolder(folderPath);
                currentFolderName = currentFolder?.name || '';
            }
            else{
                let error: Error = new Error("Please define folder structure");
                console.log(error.message);
                throw error;
            }
            
            if (currentFolderName === "GlobalScripts") {
                scriptUrl = vscode.workspace.getConfiguration().get("globalScript.url") || '';
            }else if (currentFolderName === "CustomActions") {
                scriptUrl = vscode.workspace.getConfiguration().get("customAction.url") || '';
            }

            let jsonResp = JSON.parse(data);
            let request = require('request');
            var options = {
                'method': 'POST',
                'url': this.baseUrl + scriptUrl,
                'headers': {
                    'Authorization': 'Bearer ' + jsonResp.access_token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "scriptDefinition": {
                        "id": 0,
                        "name": "TestRefactor2",
                        "description": "",
                        "modifiedBy": "srasevic",
                        "active": true,
                        "modifiedOn": "",
                        "startDate": "",
                        "endDate": "",
                        "script": "#comment",
                        "isModule": true
                    },
                    "forceProxyGeneration": false,
                    "events": []
                })
            };
            request(options, function (error: string | undefined, response: { body: any, statuscode: any }) {
                if (error) {
                    throw new Error(error);
                }
                vscode.window.showInformationMessage(response.statuscode);
                console.log(response.body);
            });
        });
    }
}