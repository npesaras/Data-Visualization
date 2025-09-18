import { Button } from './components/ui/button'
import { testConnection } from './lib/appwrite'

function App() {
  const checkConnection = async () => {
    const result = await testConnection();
    console.log(result);
  }

  return (
    <>
      <Button onClick={checkConnection} variant="outline">
        Test Connection
      </Button>
    </>
  )
}

export default App