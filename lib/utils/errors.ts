// 业务错误基类
export class BusinessError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode = 400,
  ) {
    super(message);
    this.name = 'BusinessError';
  }
}

export class NotFoundError extends BusinessError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} 不存在`, 404);
  }
}

export class ForbiddenError extends BusinessError {
  constructor(message = '没有权限') {
    super('FORBIDDEN', message, 403);
  }
}

export class UnauthorizedError extends BusinessError {
  constructor(message = '未登录') {
    super('UNAUTHORIZED', message, 401);
  }
}

export class ValidationError extends BusinessError {
  constructor(message: string, public details?: unknown) {
    super('VALIDATION_ERROR', message, 422);
  }
}

export class AIServiceUnavailableError extends BusinessError {
  constructor() {
    super('AI_UNAVAILABLE', 'AI 服务暂时不可用,请稍后重试', 503);
  }
}

export class BudgetExceededError extends BusinessError {
  constructor(message = '今日 AI 调用已达上限') {
    super('BUDGET_EXCEEDED', message, 429);
  }
}
