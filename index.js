import dotenv from "dotenv"
dotenv.config()
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import readlineSync from 'readline-sync'
import {z} from "zod"
import fs from "node:fs"
import path from "path"
import { exec } from "node:child_process";
import { PromptTemplate } from "@langchain/core/prompts";

const structure = z.object({
    htmlfiles: z.array(z.string().describe("Give me all the required html files for the website. index.html will be the starting point. Always create index.html file.")),
    htmlfilenames: z.array(z.string().describe("Give me names for all the html files for the code you have provided.")),
    cssfiles: z.array(z.string().describe("Give me all the required css files for the website.")),
    cssfilenames: z.array(z.string().describe("Give me names for all the css files for the code you have provided.")),    
    jsfiles: z.array(z.string().describe("Give me all the required js files for the website.")),
    jsfilenames: z.array(z.string().describe("Give me names for all the js files for the code you have provided.")),
    foldername: z.string().describe("The name of folder inside which all the website files will be stored")
})

const prompt = PromptTemplate.fromTemplate(
    `You are an Web Developer. You need to design webpages with html, css and js files as per the requirements.
    Always follow proper name convention between html, css and js files.
    Dont use images anywhere in the website. 
    Make the css in proper and responsive for all the device widths always.
    Always create index.html file.
    If there is login page, make it as index.html always.
    If you want to add images, add it from a free online source (like Unsplash or Picsum)
    `
);

const model = new ChatGoogleGenerativeAI({
    apiKey: process.env.API_KEY,
    model: "gemini-2.5-flash",
    temperature: 0
});

const userPrompt = readlineSync.question("Ask Anything... : ")
const structuredOutput = model.withStructuredOutput(structure)
const answer = await structuredOutput.invoke("System Prompt : "+prompt + "\nUser Prompt" + userPrompt)

console.log(answer.htmlfilenames)
console.log(answer.cssfilenames)
console.log(answer.jsfilenames)

if (!fs.existsSync(answer.foldername)) {
    fs.mkdirSync(answer.foldername, { recursive: true })
    console.log("Folder Created Successfully")
}

answer.htmlfiles.forEach((value,index)=> {
    fs.writeFileSync(path.join(answer.foldername, answer.htmlfilenames[index]), value)
})

answer.cssfiles.forEach((value,index)=> {
    fs.writeFileSync(path.join(answer.foldername, answer.cssfilenames[index]), value)
})

answer.jsfiles.forEach((value,index)=> {
    fs.writeFileSync(path.join(answer.foldername, answer.jsfilenames[index]), value)
})

const filePath = path.join(answer.foldername, 'index.html');
const filePath2 = path.join(answer.foldername, 'login.html');

if(filePath)
exec(`start "" "${filePath}"`);
else
exec(`start "" "${filePath2}"`);