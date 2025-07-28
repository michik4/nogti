interface ResponseType {
    success: boolean;
    error: string | null;
    message: string;
    status: 'ok' | 'error' | 'warning' | 'info' | 'in_progress';
    code: number;
    data: any;
}

export default ResponseType;