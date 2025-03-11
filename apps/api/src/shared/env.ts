import { ensureEnv } from "@this/env"
import auth from "@this/env/auth"
import db from "@this/env/db"
import email from "@this/env/email"
import kv from "@this/env/kv"
import queue from "@this/env/queue"

ensureEnv([auth, db, email, kv, queue])
