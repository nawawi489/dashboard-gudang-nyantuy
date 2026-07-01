import { useNavigate } from 'react-router-dom'
import { useSpvOutlet } from '../../contexts/SpvOutletContext'
import { useAuth } from '../../contexts/AuthContext'
import OutletSelector from '../../components/spv/OutletSelector'

const OutletSelectorPage = () => {
  const { setOutlet, outlet } = useSpvOutlet()
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleStart = (selectedOutlet: string, _date: string) => {
    setOutlet(selectedOutlet)
    navigate('/spv/home')
  }

  return (
    <OutletSelector
      onStart={handleStart}
      initialOutlet={outlet}
      onLogout={logout}
    />
  )
}

export default OutletSelectorPage
