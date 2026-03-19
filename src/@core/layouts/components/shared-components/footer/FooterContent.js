// ** Next Import
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'

// ** Custom Icon Import
import Icon from 'src/@core/components/icon'

const LinkStyled = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.primary.main
}))

const FooterContent = () => {
  // ** Var
  const hidden = useMediaQuery(theme => theme.breakpoints.down('md'))

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
      <Typography sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
        {`© ${new Date().getFullYear()}, Made with `}
        <Box component='span' sx={{ mx: 1.5, color: 'error.main', display: 'flex' }}>
          <Icon icon='mdi:heart' fontSize='1.25rem' />
        </Box>
        {` for `}
        <Typography component='span' sx={{ ml: 1.5, fontWeight: 700, color: 'primary.main' }}>
          Visage Soap
        </Typography>
      </Typography>
      {hidden ? null : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', '& :not(:last-child)': { mr: 4 } }}>
          <Typography variant='body2' sx={{ color: 'text.disabled' }}>
            Internal Management System
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default FooterContent
