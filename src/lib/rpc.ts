import { hc } from "hono/client";

import { AppType } from "@/app/api/[[...route]]/route";
import { envKeys } from "@/lib/env";

export const client = hc<AppType>(envKeys.appUrl);