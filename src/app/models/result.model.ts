export class ResultModel<T>{
    data?: T;
    errorMessages?: string[];
    isSuccessful: boolean = false;
    statusCode: number = 0;
}