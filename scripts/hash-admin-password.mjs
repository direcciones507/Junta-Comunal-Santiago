// Pipe a password through stdin; never pass a secret as a command-line argument.
import {hashPassword} from '../server/institution-auth.mjs';
let password='';for await(const part of process.stdin){password+=part;if(password.length>1024)throw new Error('Entrada demasiado larga.');}
console.log(await hashPassword(password.replace(/\r?\n$/,'')));
