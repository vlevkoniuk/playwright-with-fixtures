export interface ConfigDto {
    auth: AuthDto;
    automationExerciseAuth: AutomationExerciseAuthDto;
    uiConfig: UiConfigDto;
    apiConfig: ApiConfigDto;
}

export interface AuthDto {
    login: string;
    password: string;
    apiToken: string;
}

export interface AutomationExerciseAuthDto {
    email: string;
    password: string;
}

export interface UiConfigDto {
    jiraBaseUrl: string;
    atlassianBaseUrl: string;
    automationExerciseBaseUrl: string;
}

export interface ApiConfigDto {
    jiraApiUrl: string;
}
