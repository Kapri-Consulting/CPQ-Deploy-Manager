import * as vscode from 'vscode';

export class CpqService {
    
    /**
     * GetBearerToken: Gets bearer token for login
     */
    private GetBearerToken(callback: any) {
        var request = require('request');
        var options = {
            'method': 'POST',
            'url': 'https://sandbox.webcomcpq.com/basic/api/token',
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            form: {
                'grant_type': 'password',
                'username': 'srasevic',
                'password': 'password1',
                'domain': 'stefanrasevic'
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
        this.GetBearerToken(function (data: any) {
            vscode.window.showInformationMessage(data);
            let jsonResp = JSON.parse(data);
            let request = require('request');
            var options = {
                'method': 'POST',
                'url': 'https://sandbox.webcomcpq.com/api/script/v1/GlobalScripts',
                'headers': {
                    'Authorization': 'Bearer ' + jsonResp.access_token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "scriptDefinition": {
                        "id": 20,
                        "name": "Test1235",
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
            request(options, function (error: string | undefined, response: { body: any; }) {
                if (error) {
                    throw new Error(error);
                }
                console.log(response.body);
            });
        });
    }
}