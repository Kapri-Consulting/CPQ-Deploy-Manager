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
                    'url': 'https://sandbox.webcomcpq.com/cart/edit?cartCompositeNumber=01230022',
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
                        'url': 'https://sandbox.webcomcpq.com/api/rd/v1/ScriptDebugger/RunScript',
                        'headers': {
                            'X-CSRF-Token': JSON.parse(data),
                            'Content-Type': 'application/json',
                            'Cookie': cookie
                        },
                        body: JSON.stringify(s)

                        };
                        request(options, function (error: string | undefined, response: { body: any; }) {
                        if (error) throw new Error(error);
                        console.log(response.body);
                        var message = JSON.parse(response.body).Traces;
                        let orange = vscode.window.createOutputChannel("SAP CPQ");
                        message.forEach((c: { Message: string; }) => {
                            orange.appendLine(c.Message);
                        });

                        orange.appendLine(JSON.parse(response.body));
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
    
            const fileUri = vscode.window.activeTextEditor.document.uri;
            
            const folderPath = posix.dirname(fileUri.path).split("/");
            const folderName = folderPath[folderPath.length-1]
            const fileName = posix.basename(fileUri.path);            

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
                scriptUrl = vscode.workspace.getConfiguration().get("customAction.url") || '';
            }
            
            let jsonResp = JSON.parse(data);
            let request = require('request');
            var options = {
                'method': 'Put',
                'url': this.baseUrl + scriptUrl,
                'headers': {
                    'Authorization': 'Bearer ' + jsonResp.access_token,
                    'Content-Type': 'application/json'
                }
            };

            //get script/html ID

            //prepare body

            //execute

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
            let customResponsiveTemplates: string = "";
            

            if (vscode.workspace.workspaceFolders !== undefined) {
                const folderPath = vscode.workspace.workspaceFolders[0].uri;
                const currentFolder = vscode.workspace.getWorkspaceFolder(folderPath);
                countAndTotalOfFilesInFolder(folderPath,"GlobalScripts");
                countAndTotalOfFilesInFolder(folderPath,"CustomActions");
                countAndTotalOfFilesInFolder(folderPath,"UI");
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
            request(options, function (error: string | undefined, response: { body: any, statuscode: any }) {
                if (error) {
                    throw new Error(error);
                }
                vscode.window.showInformationMessage(response.statuscode);
                var scripts = JSON.parse(response.body);
                scripts.pagedRecords.forEach(async function (value: any) {
                    
                    
                        if (!vscode.workspace.workspaceFolders) {
                            return vscode.window.showInformationMessage('No folder or workspace opened');
                        }
                        const writeStr = "''' \nid:" + JSON.stringify(value.scriptDefinition.id) + "'''" + '\n' + value.scriptDefinition.script;
                        const writeData = Buffer.from(writeStr, 'utf8');
                        const folderUri = vscode.workspace.workspaceFolders[0].uri;
                        const fileUri = folderUri.with({ path: posix.join(folderUri.path + "/GlobalScripts", value.scriptDefinition.name + "_" + value.scriptDefinition.id + ".py") });
                        await vscode.workspace.fs.writeFile(fileUri, writeData);
                });
            });

            options = {
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
                var scripts = JSON.parse(response.body);
                scripts.pagedRecords.forEach(async function (value: any) {
                    
                    
                        if (!vscode.workspace.workspaceFolders) {
                            return vscode.window.showInformationMessage('No folder or workspace opened');
                        }
                        const writeStr = "''' \nid:" + JSON.stringify(value.actionDefinition.id) + "'''" + '\n' + value.actionDefinition.script;
                        const writeData = Buffer.from(writeStr, 'utf8');
                        const folderUri = vscode.workspace.workspaceFolders[0].uri;
                        const fileUri = folderUri.with({ path: posix.join(folderUri.path + "/CustomActions", value.actionDefinition.name + "_" + value.actionDefinition.id + ".py") });
                        await vscode.workspace.fs.writeFile(fileUri, writeData);
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
            request(options, function (error: string | undefined, response: { body: any, statuscode: any }) {
                if (error) {
                    throw new Error(error);
                }
                vscode.window.showInformationMessage(response.statuscode);
                var scripts = JSON.parse(response.body);
                scripts.pagedRecords.forEach(async function (value: any) {
                    
                    
                        if (!vscode.workspace.workspaceFolders) {
                            return vscode.window.showInformationMessage('No folder or workspace opened');
                        }
                        const writeStr = value.content;
                        const writeData = Buffer.from(writeStr, 'utf8');
                        const folderUri = vscode.workspace.workspaceFolders[0].uri;
                        const fileUri = folderUri.with({ path: posix.join(folderUri.path + "/UI", value.name + "_" + value.id + ".html") });
                        await vscode.workspace.fs.writeFile(fileUri, writeData);
                });
            });
        });
    }
}