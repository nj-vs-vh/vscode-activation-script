import * as vscode from 'vscode';
import * as fs from 'fs';


const DOT_VSCODE = ".vscode";

function getDotVscodeUri(): vscode.Uri {
	let wsFolders = vscode.workspace.workspaceFolders;
	if (wsFolders === undefined) {
		throw Error("You must open workspace folder before selecting activation script");
	}
	if (wsFolders.length > 1) {
		throw Error("Multi-root workspaces are currently not supported");
	}
	return vscode.Uri.joinPath(wsFolders[0].uri, DOT_VSCODE);
}


const ACTIVATION_JSON = "activation.json";

function getActivationJsonUri(): vscode.Uri {
	return vscode.Uri.joinPath(getDotVscodeUri(), ACTIVATION_JSON);
}


function ensureActivationJson() {
	let dotVscodeDir = getDotVscodeUri();
	if (!fs.existsSync(dotVscodeDir.fsPath)) {
		fs.mkdirSync(dotVscodeDir.fsPath);
	}
	let activationJson = getActivationJsonUri();
	if (!fs.existsSync(activationJson.fsPath)) {
		let defaultData = {
			"scripts": [],
			"commands": [],
		};
		fs.writeFileSync(activationJson.fsPath, JSON.stringify(defaultData, undefined, 4));
	}
}


function saveActivationScript(scriptUri: vscode.Uri) {
	ensureActivationJson();
	const uri = getActivationJsonUri();
	vscode.workspace.openTextDocument(uri).then(
		(doc) => {
			const data = JSON.parse(doc.getText());
			data["scripts"].push({ "path": scriptUri.fsPath });
			fs.writeFileSync(uri.fsPath, JSON.stringify(data, undefined, 4));
		}
	);
}


function activateTerminal(t: vscode.Terminal) {
	const uri = getActivationJsonUri();
	if (!fs.existsSync(uri.fsPath)) {
		return;
	}
	vscode.workspace.openTextDocument(uri).then(
		(doc) => {
			const data = JSON.parse(doc.getText());
			for (const script of data['scripts']) {
				t.sendText(`. ${script["path"]}`, true);
			}
			for (const cmd of data['commands']) {
				t.sendText(cmd, true);
			}
		}
	);
}


export function activate(context: vscode.ExtensionContext) {

	console.log('"activation-script" extension is active!');

	let disposables: vscode.Disposable[] = [];

	disposables.push(
		vscode.commands.registerCommand('activation-script.addActivationScript', () => {
			vscode.window.showOpenDialog({ canSelectMany: false }).then(
				(activationScriptUri) => {
					if (activationScriptUri === undefined) {
						return;
					}
					saveActivationScript(activationScriptUri[0]);
				}
			);
		})
	);

	vscode.window.onDidOpenTerminal(activateTerminal, null, disposables);

	context.subscriptions.push(...disposables);
}

export function deactivate() { }
