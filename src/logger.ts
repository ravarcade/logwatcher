'use strict';

import * as vscode from 'vscode';

export let logChannel = vscode.window.createOutputChannel("logwatcher");
export function log(...o: any) {

    function mapObject(obj: any) {

        switch (typeof obj) {
            case 'undefined':
                return 'undefined';

            case 'string':
                return obj;

            case 'number':
                return obj.toString;

            case 'object':
                let ret: string = '';
                for (const [key, value] of Object.entries(obj)) {
                    ret += (`${key}: ${value}\n`);
                }
                return ret;

            default:
                return obj; //function,symbol,boolean

        }

    }

    o.map((args: any) => {
        logChannel.append('' + mapObject(args));
    });
    logChannel.appendLine('');
    // logChannel.show();

}