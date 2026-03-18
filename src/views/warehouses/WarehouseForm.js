import { useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import DialogContent from '@mui/material/DialogContent'
import CircularProgress from '@mui/material/CircularProgress'
import { styled } from '@mui/material/styles'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import toast from 'react-hot-toast'
import axios from 'src/api/axiosInstance'

const CustomDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    width: '100%',
    maxWidth: 500,
    borderRadius: 16,
    padding: theme.spacing(4)
  }
}))

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(3),
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '1rem',
  boxShadow: 'none',
  marginTop: theme.spacing(4)
}))

const WarehouseForm = ({ open, onClose, onSuccess, warehouse = null }) => {
  const isEdit = !!warehouse

  // ** State
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: warehouse?.name || '',
    code: warehouse?.code || '',
    city: warehouse?.city || '',
    address: warehouse?.address || ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.code || !formData.city || !formData.address) {
      toast.error('Please fill all fields')
      return
    }

    try {
      setLoading(true)
      let response
      if (isEdit) {
        response = await axios.put(`/api/warehouses/${warehouse._id}`, formData)
      } else {
        response = await axios.post('/api/warehouses', formData)
      }

      if (response.data.success) {
        toast.success(`Warehouse ${isEdit ? 'updated' : 'added'} successfully`)
        onSuccess()
        onClose()
      }
    } catch (error) {
      console.error('Failed to save warehouse:', error)
      toast.error(error.response?.data?.message || 'Failed to save warehouse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <CustomDialog open={open} onClose={onClose} fullWidth>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 6 }}>
        <IconButton onClick={onClose} sx={{ mr: 2, color: 'text.secondary' }}>
          <Icon icon='mdi:arrow-left' />
        </IconButton>
        <Typography variant='h5' sx={{ fontWeight: 700, flexGrow: 1, textAlign: 'center' }}>
          {isEdit ? 'Edit Warehouse' : 'Add Warehouse'}
        </Typography>
        <Box sx={{ width: 40 }} />
      </Box>

      <DialogContent sx={{ p: 0 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={5}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Warehouse Name'
                placeholder='e.g. Islamabad HQ'
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                variant='outlined'
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Warehouse Code'
                placeholder='e.g. WH-001'
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                variant='outlined'
                disabled={isEdit}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='City'
                placeholder='e.g. Islamabad'
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                variant='outlined'
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label='Address'
                placeholder='Full address...'
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                variant='outlined'
              />
            </Grid>
          </Grid>

          <StyledButton
            fullWidth
            variant='contained'
            type='submit'
            disabled={loading}
            sx={{ 
              bgcolor: '#00AEEF',
              '&:hover': { bgcolor: '#0096ce' }
            }}
          >
            {loading ? <CircularProgress size={24} color='inherit' /> : isEdit ? 'Update Warehouse' : 'Add Warehouse'}
          </StyledButton>
        </form>
      </DialogContent>
    </CustomDialog>
  )
}

export default WarehouseForm
