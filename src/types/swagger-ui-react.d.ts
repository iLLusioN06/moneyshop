declare module "swagger-ui-react" {
  import { ReactElement } from "react";

  interface SwaggerUIProps {
    spec?: Record<string, unknown> | string;
    url?: string;
    layout?: string;
    requestInterceptor?: (req: Request) => Request | Promise<Request>;
    responseInterceptor?: (res: Response) => Response | Promise<Response>;
    supportedSubmitMethods?: string[];
    queryConfigEnabled?: boolean;
    plugins?: Record<string, unknown>[];
    displayOperationId?: boolean;
    showMutatedRequest?: boolean;
    docExpansion?: "list" | "full" | "none";
    defaultModelExpandDepth?: number;
    defaultModelsExpandDepth?: number;
    defaultModelRendering?: "example" | "model";
    presets?: ((system: unknown) => unknown)[];
    deepLinking?: boolean;
    showExtensions?: boolean;
    showCommonExtensions?: boolean;
    filter?: string | boolean;
    requestSnippetsEnabled?: boolean;
    requestSnippets?: Record<string, unknown>;
    tryItOutEnabled?: boolean;
    displayRequestDuration?: boolean;
    withCredentials?: boolean;
    persistAuthorization?: boolean;
    oauth2RedirectUrl?: string;
    onComplete?: (system: unknown) => void;
    initialState?: Record<string, unknown>;
    uncaughtExceptionHandler?: (error: Error) => void;
  }

  const SwaggerUI: (props: SwaggerUIProps) => ReactElement;
  export default SwaggerUI;
}
