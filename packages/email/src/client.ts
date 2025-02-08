import { Resend } from "resend"

import env from "@this/env/email.server"

const resend = new Resend(env.RESEND_API_KEY)

export default resend
