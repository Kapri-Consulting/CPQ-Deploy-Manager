import { posix } from 'path';
import { TextEncoder } from 'util';
import * as vscode from 'vscode';

export class CpqService {
    private baseUrl: string = "";
    private context;
    

    /**
     * Initializes CpqService object
     */
    constructor(context: vscode.ExtensionContext) {
        this.baseUrl = vscode.workspace.getConfiguration().get("cpq.url") || '';
        this.context = context;
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

    private login(callback:any){
            let username: string = vscode.workspace.getConfiguration().get("cpq.username") || '';
            let password: string = vscode.workspace.getConfiguration().get("cpq.password") || '';
            let domain: string = vscode.workspace.getConfiguration().get("cpq.domain") || '';
            var loginUrl = vscode.workspace.getConfiguration().get("login.url") || '';

            let request = require('request');
            var options = {
                'method': 'POST',
                'url': this.baseUrl + loginUrl +"username="+username+"&password="+password+"&domain="+domain,
                'headers': {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            };
            request(options, function (error: string | undefined, response: { body: any; }) { 
                if (error) {throw new Error(error);}
                callback(response.body);
            });
    }

    private login2(callback:any){
        let username: string = vscode.workspace.getConfiguration().get("cpq.username") || '';
        let password: string = vscode.workspace.getConfiguration().get("cpq.password") || '';
        let domain: string = vscode.workspace.getConfiguration().get("cpq.domain") || '';
        var loginUrl = vscode.workspace.getConfiguration().get("login.url") || '';

        let request = require('request');
        var options = {
            'method': 'POST',
            'url': this.baseUrl + loginUrl +"username="+username+"&password="+password+"&domain="+domain,
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };
        request(options, function (error: string | undefined, response: { body: any; headers: any}) { 
            if (error) {throw new Error(error);}
            callback(response.body,response.headers['set-cookie']);
        });
}

    executeScript(){
            this.login2((data: any,cookies: any) =>{
            
                var quoteNumber = vscode.workspace.getConfiguration().get("quoteNumber") || '';
                var editQuoteUrl = vscode.workspace.getConfiguration().get("quoteEdit.url") || '';
                var loginUrl = vscode.workspace.getConfiguration().get("login.url") || '';
                var runScriptUrl = vscode.workspace.getConfiguration().get("scriptDebugger.url") || '';

                let jsonResp = JSON.parse(data);
                let request = require('request'); 
                let cookie = ""; 

                cookies.forEach((c: string) => {
                    var json = c.split(';');
                    cookie = cookie + json[0] +';';
                }); 
                      

                //quote edit
                var options = {
                    'method': 'GET',
                    'url': this.baseUrl + editQuoteUrl + quoteNumber,
                    'headers': {
                        'X-CSRF-Token':jsonResp,
                        'Content-Type': 'application/json',
                        'Cookie': cookie
                    }
                };

                request(options,  (error: string | undefined, response: { body: any, statuscode: any }) => {
                    if (error) {
                        throw new Error(error);
                    }
                    console.log(response);

                        var request = require('request');
                        let cookie = ""; 

                        cookies.forEach((c: string) => {
                            var json = c.split(';');
                            cookie = cookie + json[0] +';';
                        });

                        if (!vscode.window.activeTextEditor) {
                            return vscode.window.showInformationMessage('Open a file first');
                        }
                
                        const s = vscode.window.activeTextEditor.document.getText();
                        var options = {
                        'method': 'POST',
                        'url': this.baseUrl + runScriptUrl,
                        'headers': {
                            'X-CSRF-Token': JSON.parse(data),
                            'Content-Type': 'application/json',
                            'Cookie': cookie
                        },
                        body: JSON.stringify(s)

                        };
                        request(options, function (error: string | undefined, response: { body: any; }) {
                        if (error) {throw new Error(error);}
                        console.log(response.body);
                        var message = JSON.parse(response.body).Traces;
                        let orange = vscode.window.createOutputChannel("SAP CPQ");
                        
                        message.forEach((c: { Message: string; }) => {
                            orange.appendLine(c.Message);
                        });
                        if (JSON.parse(response.body).Success == false){
                            orange.appendLine(JSON.parse(response.body).ErrorMessage); 
                        }
                        //orange.appendLine(response.body);
                        //vscode.window.activeTerminal?.sendText(response.body,true);
                        //console.log(response.body);
                        orange.show();
                        });
 
                });
        }); 

        }


    putScript() {
        this.GetBearerToken((data: any) =>{
            //get script we are working on
            //get folder script is located
            if (!vscode.window.activeTextEditor) {
                return vscode.window.showInformationMessage('Open a file first');
            }
            var scriptUrl = "";
            const url = this.baseUrl;
    
            const fileUri = vscode.window.activeTextEditor.document.uri;
            const fileContent = vscode.window.activeTextEditor.document.getText();
            
            const folderPath = posix.dirname(fileUri.path).split("/");
            const folderName = folderPath[folderPath.length-1];
            const fileName = vscode.window.activeTextEditor.document.fileName;
            var fileNameSplit= fileName.split("/");
            var fileNameTemp = fileNameSplit[fileNameSplit.length-1];
            var file = fileNameTemp.split(".")[0];
            var fileID = this.context.workspaceState.get(file);
            //fileID = fileID.split(".")[0];


            //based on folder build PUT url
            if(folderName === "UI"){
                scriptUrl = vscode.workspace.getConfiguration().get("customResponsiveTemplates.url") || '';
            }
            else if(folderName === "GlobalScripts"){
                scriptUrl = vscode.workspace.getConfiguration().get("globalScript.url") || '';
            }
            else if(folderName === "CustomActions"){
                scriptUrl = vscode.workspace.getConfiguration().get("customAction.url") || '';
            }
            else{
                scriptUrl = vscode.workspace.getConfiguration().get("customCalculations.url") || '';
            }
            
            let jsonResp = JSON.parse(data);
            let request = require('request');
            var options = {
                'method': 'GET',
                'url': this.baseUrl + scriptUrl+'/'+fileID,
                'headers': {
                    'Authorization': 'Bearer ' + jsonResp.access_token,
                    'Content-Type': 'application/json'
                }
            };
            var scripts;
            request(options, function (error: string | undefined, response: { body: any, statuscode: any }) {
                if (error) {
                    throw new Error(error);
                }
                vscode.window.showInformationMessage(response.statuscode);
                scripts = JSON.parse(response.body);
                if(folderName === "UI"){
                    scriptUrl = vscode.workspace.getConfiguration().get("customResponsiveTemplates.url") || '';
                }
                else if(folderName === "GlobalScripts"){
                    scripts.scriptDefinition.script = fileContent || '';
                }
                else if(folderName === "CustomActions"){
                    scripts.actionDefinition.script = fileContent || '';
                }
                else{
                    scripts.calculationDefinition.script = fileContent|| '';
                }
                

                var optionsPut = {
                    'method': 'PUT',
                    'url':url + scriptUrl+'/'+fileID,
                    'headers': {
                        'Authorization': 'Bearer ' + jsonResp.access_token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(scripts)
    
                    };
                    request(optionsPut, function (error: string | undefined, response: { body: any; }) {
                    if (error) {throw new Error(error);}
                    console.log(response.body);
                    var message = JSON.parse(response.body).Traces;
                    let orange = vscode.window.createOutputChannel("SAP CPQ");
                    message.forEach((c: { Message: string; }) => {
                        orange.appendLine(c.Message);
                    });
    
                    orange.append(response.body);
                    orange.show();
                    
                    });
            });

            

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

            //let nme = this.context.workspaceState.get("ivan");

            vscode.window.showInformationMessage(data);
            let currentFolderName: string = "";
            let scriptUrl: string = "";
            let customActionsUrl: string = "";
            let customResponsiveTemplates: string = "";
            let customCalculationsUrl: string = "";
            let configurationFile: Map<string, number> = new Map();
            let configurationUri;
            

            if (vscode.workspace.workspaceFolders !== undefined) {
                const folderPath = vscode.workspace.workspaceFolders[0].uri;
                configurationUri = folderPath.with({ path: posix.join(folderPath.path + "/configuration.json") });
                const currentFolder = vscode.workspace.getWorkspaceFolder(folderPath);
                countAndTotalOfFilesInFolder(folderPath,"GlobalScripts");
                countAndTotalOfFilesInFolder(folderPath,"CustomActions");
                countAndTotalOfFilesInFolder(folderPath,"UI");
                countAndTotalOfFilesInFolder(folderPath,"CustomCalculations");
                currentFolderName = currentFolder?.name || '';
                

            }
            else{
                let error: Error = new Error("Please define folder structure");
                console.log(error.message);
                throw error;
            }
            scriptUrl = vscode.workspace.getConfiguration().get("globalScript.url") || '';
            customActionsUrl = vscode.workspace.getConfiguration().get("customAction.url") || '';
            customResponsiveTemplates = vscode.workspace.getConfiguration().get("customResponsiveTemplates.url") || '';
            customCalculationsUrl = vscode.workspace.getConfiguration().get("customCalculations.url") || '';

            /*if (currentFolderName === "GlobalScripts") {
                scriptUrl = vscode.workspace.getConfiguration().get("globalScript.url") || '';
            }else if (currentFolderName === "CustomActions") {
                scriptUrl = vscode.workspace.getConfiguration().get("customAction.url") || '';
            }*/

            let jsonResp = JSON.parse(data);
            let request = require('request');
            var options = {
                'method': 'Get',
                'url': this.baseUrl + scriptUrl+'?$top=100',
                'headers': {
                    'Authorization': 'Bearer ' + jsonResp.access_token,
                    'Content-Type': 'application/json'
                }
                    };
            request(options,  (error: string | undefined, response: { body: any, statuscode: any }) => {
                if (error) {
                    throw new Error(error);
                }
                vscode.window.showInformationMessage(response.statuscode);
                var scripts = JSON.parse(response.body);
                scripts.pagedRecords.forEach(async  (value: any) => {
                    
                    
                        if (!vscode.workspace.workspaceFolders) {
                            return vscode.window.showInformationMessage('No folder or workspace opened');
                        }
                        
                        const writeStr = value.scriptDefinition.script;
                        const writeData = Buffer.from(writeStr, 'utf8');
                        const folderUri = vscode.workspace.workspaceFolders[0].uri;
                        const fileUri = folderUri.with({ path: posix.join(folderUri.path + "/GlobalScripts", value.scriptDefinition.name + ".py") });
                        //configurationFile.set(value.scriptDefinition.name, value.scriptDefinition.id);
                        this.context.workspaceState.update(value.scriptDefinition.name,value.scriptDefinition.id);
                        
                        await vscode.workspace.fs.writeFile(fileUri, writeData);
                });
            });

            options = {
                'method': 'Get',
                'url': this.baseUrl + customCalculationsUrl+'?$top=100',
                'headers': {
                    'Authorization': 'Bearer ' + jsonResp.access_token,
                    'Content-Type': 'application/json'
                }
                    };
            request(options,  (error: string | undefined, response: { body: any, statuscode: any }) => {
                if (error) {
                    throw new Error(error);
                }
                vscode.window.showInformationMessage(response.statuscode);
                var scripts = JSON.parse(response.body);
                scripts.pagedRecords.forEach(async  (value: any) => {
                    
                    
                        if (!vscode.workspace.workspaceFolders) {
                            return vscode.window.showInformationMessage('No folder or workspace opened');
                        }
                        const writeStr = value.calculationDefinition.script;
                        const writeData = Buffer.from(writeStr, 'utf8');
                        const folderUri = vscode.workspace.workspaceFolders[0].uri;
                        const fileUri = folderUri.with({ path: posix.join(folderUri.path + "/CustomCalculations", value.calculationDefinition.name + ".py") });
                        await vscode.workspace.fs.writeFile(fileUri, writeData);
                        this.context.workspaceState.update(value.calculationDefinition.name,value.calculationDefinition.id);
                });
            });

            options = {
                'method': 'Get',
                'url': this.baseUrl + customActionsUrl+'?$top=100',
                'headers': {
                    'Authorization': 'Bearer ' + jsonResp.access_token,
                    'Content-Type': 'application/json'
                }
                    };
            request(options,  (error: string | undefined, response: { body: any, statuscode: any }) => {
                if (error) {
                    throw new Error(error);
                }
                vscode.window.showInformationMessage(response.statuscode);
                var scripts = JSON.parse(response.body);
                scripts.pagedRecords.forEach(async  (value: any) => {
                    
                    
                        if (!vscode.workspace.workspaceFolders) {
                            return vscode.window.showInformationMessage('No folder or workspace opened');
                        }
                        const writeStr = value.actionDefinition.script;
                        const writeData = Buffer.from(writeStr, 'utf8');
                        const folderUri = vscode.workspace.workspaceFolders[0].uri;
                        const fileUri = folderUri.with({ path: posix.join(folderUri.path + "/CustomActions", value.actionDefinition.name + ".py") });
                        await vscode.workspace.fs.writeFile(fileUri, writeData);
                        this.context.workspaceState.update(value.actionDefinition.name,value.actionDefinition.id);

                });
            });

            options = {
                'method': 'Get',
                'url': this.baseUrl + customResponsiveTemplates+'?$top=100',
                'headers': {
                    'Authorization': 'Bearer ' + jsonResp.access_token,
                    'Content-Type': 'application/json'
                }
                    };
            request(options,  (error: string | undefined, response: { body: any, statuscode: any }) => {
                if (error) {
                    throw new Error(error);
                }
                vscode.window.showInformationMessage(response.statuscode);
                var scripts = JSON.parse(response.body);
                scripts.pagedRecords.forEach(async  (value: any) => {
                    
                    
                        if (!vscode.workspace.workspaceFolders) {
                            return vscode.window.showInformationMessage('No folder or workspace opened');
                        }
                        const writeStr = value.content;
                        const writeData = Buffer.from(writeStr, 'utf8');
                        const folderUri = vscode.workspace.workspaceFolders[0].uri;
                        const fileUri = folderUri.with({ path: posix.join(folderUri.path + "/UI", value.name +".html") });
                        await vscode.workspace.fs.writeFile(fileUri, writeData);
                        this.context.workspaceState.update(value.name,value.id);

                });

                
            });
            
            vscode.workspace.fs.writeFile(configurationUri, Buffer.from(JSON.stringify(configurationFile), 'utf8'));

            
        });
    }
}