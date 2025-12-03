import path from 'path';
import fs from 'fs';
import { AuthDto, AutomationExerciseAuthDto, ConfigDto } from '../models/config.dto';
import dotenv from 'dotenv';

export class ConfigService {
    public get config(): ConfigDto {
        return this._config ?? this.initConfig();
    }
    private _config: ConfigDto | undefined;

    public constructor() {
        this.initConfig();
        dotenv.config();
    }

    private initConfig(): ConfigDto {
        this.readFileConfig();
        this.readAuthConfig();
        this.readAutomationExerciseAuthConfig();
        return this._config as ConfigDto;
    }

    private readAuthConfig(): void {
        const authConfig: AuthDto = {
            login: process.env.JIRA_LOGIN as string,
            password: process.env.JIRA_PASSWORD as string,
            apiToken: Buffer.from(`${process.env.JIRA_LOGIN}:${process.env.JIRA_PASSWORD}`).toString('base64')
        };
        this._config = { ...this._config, ...{ auth: authConfig } } as ConfigDto;
    }

    private readAutomationExerciseAuthConfig(): void {
        const automationExerciseAuthConfig: AutomationExerciseAuthDto = {
            email: process.env.AUTOMATION_EXERCISE_EMAIL ?? 'levkoniuk@gmail.com',
            password: process.env.AUTOMATION_EXERCISE_PASSWORD ?? 'qwerto'
        };
        this._config = { ...this._config, ...{ automationExerciseAuth: automationExerciseAuthConfig } } as ConfigDto;
    }

    private readFileConfig(): void {
        const filePath = path.resolve(__dirname, '../config/jira-test.config.json');
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        this._config = { ...this._config, ...JSON.parse(fileContent) } as ConfigDto;
    }
}
