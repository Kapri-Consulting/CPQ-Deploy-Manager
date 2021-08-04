// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { userInfo } from 'os';
import * as vscode from 'vscode';
import { CpqService } from "./lib/cpq_service";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "cpq-deployment-manager" is now active!');
	
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json

	let write = vscode.commands.registerCommand('cpq-deployment-manager.write', () => {
		// The code you place here will be executed every time your command is executed
		let cpq_service: CpqService = new CpqService();
		cpq_service.putScript();
		// Display a message box to the user
		//vscode.window.showInformationMessage('Hello World from Cpq Deployment Manager!');
	});

	vscode.commands.registerCommand('cpq-deployment-manager.pushselection', () => {
		// The code you place here will be executed every time your command is executed
		let cpq_service: CpqService = new CpqService();
		cpq_service.putScript();
		// Display a message box to the user
		//vscode.window.showInformationMessage('Hello World from Cpq Deployment Manager!');
	});

	vscode.commands.registerCommand('cpq-deployment-manager.pushall', () => {
		// The code you place here will be executed every time your command is executed
		let cpq_service: CpqService = new CpqService();
		cpq_service.postScript();
		// Display a message box to the user
		//vscode.window.showInformationMessage('Hello World from Cpq Deployment Manager!');
	});

	vscode.commands.registerCommand('cpq-deployment-manager.create', () => {
		// The code you place here will be executed every time your command is executed
		let cpq_service: CpqService = new CpqService();
		cpq_service.postScript();
		// Display a message box to the user
		//vscode.window.showInformationMessage('Hello World from Cpq Deployment Manager!');
	});

	vscode.commands.registerCommand('cpq-deployment-manager.debug', () => {
		// The code you place here will be executed every time your command is executed
		let cpq_service: CpqService = new CpqService();
		cpq_service.executeScript();
		// Display a message box to the user
		//vscode.window.showInformationMessage('Hello World from Cpq Deployment Manager!');
	});

	let disposable = vscode.commands.registerCommand('cpq-deployment-manager.deploy', () => {
		// The code you place here will be executed every time your command is executed
		let cpq_service: CpqService = new CpqService();
		cpq_service.postScript();
		// Display a message box to the user
		//vscode.window.showInformationMessage('Hello World from Cpq Deployment Manager!');
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(write);

}

// this method is called when your extension is deactivated
export function deactivate() {}
