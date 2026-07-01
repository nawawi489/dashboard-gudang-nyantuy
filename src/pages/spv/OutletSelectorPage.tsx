import { useNavigate } from 'react-router-dom'
import { useSpvOutlet } from '../../contexts/SpvOutletContext'
import { useAuth } from '../../contexts/AuthContext'
import OutletSelector from '../../components/spv/OutletSelector'
import { getTodayDateJakarta } from '../../utils/date'

const OutletSelectorPage = () => {
  const { setOutlet, outlet } = useSpvOutlet()
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleStart = (selectedOutlet: string) => {
    setOutlet(selectedOutlet)
    navigate('/spv/home')
  }

  return (
    <OutletSelector
      onStart={(o) => handleStart(o, getTodayDateJakarta())}
      initialOutlet={outlet}
      initialDate={getTodayDateJakarta()}
      onLogout={logout}
    />
  )
}

export default OutletSelectorPage
