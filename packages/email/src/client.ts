import { Resend } from "resend"

import env from "@init/env/email"

const resend = new Resend(env.RESEND_API_KEY)

export default resend
