import { Button } from "@this/ui/components/button"
import { Input } from "@this/ui/components/input"
import { useState } from "react"
import reactLogo from "~/assets/react.svg"
import wxtLogo from "~/static/wxt.svg"

function App() {
  const [count, setCount] = useState(0)

  return (
    <main className="flex h-screen w-[400px] flex-col items-center justify-center">
      <div>
        <a href="https://wxt.dev" target="_blank" rel="noreferrer">
          <img src={wxtLogo} className="logo" alt="WXT logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1 className="text-2xl text-yellow-500">WXT + React</h1>
      <div className="card">
        <Button onClick={() => setCount(count => count + 1)} type="button">
          count is {count}
        </Button>
        <Input />
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the WXT and React logos to learn more
      </p>
    </main>
  )
}

export default App
