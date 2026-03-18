import { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  alpha
} from '@mui/material'
import { styled } from '@mui/material/styles'
import Icon from 'src/@core/components/icon'
import axios from 'src/api/axiosInstance'
import toast from 'react-hot-toast'

const FormWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(6, 10),
  backgroundColor: theme.palette.background.paper
}))

const SectionTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.info.main,
  fontWeight: 700,
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  marginBottom: theme.spacing(4)
}))

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.default,
    '& fieldset': {
      borderColor: theme.palette.divider
    }
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.875rem'
  }
}))

const SubmitButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(8),
  paddingVertical: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  fontWeight: 700,
  fontSize: '1rem',
  textTransform: 'none',
  backgroundColor: theme.palette.info.main,
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: theme.palette.info.dark
  }
}))

const ProductForm = ({ product, onClose, isEdit = false }) => {
  const [formData, setFormData] = useState({
    productName: '',
    variant: '',
    size: '',
    sku: '',
    cartonConversion: '',
    costPerPiece: '',
    pricePerPiece: '',
    pricePerCarton: ''
  })

  useEffect(() => {
    if (product && isEdit) {
      setFormData({
        productName: product.productName || '',
        variant: product.variant || '',
        size: product.size || '',
        sku: product.sku || '',
        cartonConversion: product.cartonConversion || '',
        costPerPiece: product.costPerPiece || '',
        pricePerPiece: product.pricePerPiece || '',
        pricePerCarton: product.pricePerCarton || ''
      })
    } else {
      setFormData({
        productName: '',
        variant: '',
        size: '',
        sku: '',
        cartonConversion: '',
        costPerPiece: '',
        pricePerPiece: '',
        pricePerCarton: ''
      })
    }
  }, [product, isEdit])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => {
      const newState = { ...prev, [name]: value }
      
      // Auto calculate price per carton if pieces or price per piece changes
      if (name === 'pricePerPiece' || name === 'cartonConversion') {
        const ppp = name === 'pricePerPiece' ? Number(value) : Number(prev.pricePerPiece)
        const cc = name === 'cartonConversion' ? Number(value) : Number(prev.cartonConversion)
        newState.pricePerCarton = isNaN(ppp * cc) ? 0 : ppp * cc
      }
      
      return newState
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        productName: formData.productName,
        variant: formData.variant,
        size: formData.size,
        sku: formData.sku,
        cartonConversion: Number(formData.cartonConversion),
        costPerPiece: Number(formData.costPerPiece),
        pricePerPiece: Number(formData.pricePerPiece)
      }

      console.log('Sending payload:', payload)

      let response
      if (isEdit) {
        // Remove SKU from payload as it cannot be changed in edit
        delete payload.sku
        response = await axios.put(`/api/products/${product._id}`, payload)
      } else {
        response = await axios.post('/api/products', payload)
      }

      if (response.data.success) {
        toast.success(isEdit ? 'Product updated successfully' : 'Product added successfully')
        onClose()
      }
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message)
      toast.error(error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'add'} product`)
    }
  }

  return (
    <FormWrapper>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 8, position: 'relative' }}>
        <IconButton onClick={onClose} sx={{ position: 'absolute', left: -20 }}>
          <Icon icon='mdi:arrow-left' />
        </IconButton>
        <Typography variant='h5' sx={{ fontWeight: 600 }}>{isEdit ? 'Edit Product' : 'Add Product'}</Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <SectionTitle>Basic Info</SectionTitle>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <StyledTextField
              fullWidth
              label='Product Name'
              name='productName'
              value={formData.productName}
              onChange={handleChange}
              placeholder='Product Name'
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <Icon icon='mdi:cube-outline' />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <StyledTextField
              fullWidth
              label='Variant'
              name='variant'
              value={formData.variant}
              onChange={handleChange}
              placeholder='Variant'
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <Icon icon='mdi:label-outline' />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <StyledTextField
              fullWidth
              label='Size'
              name='size'
              value={formData.size}
              onChange={handleChange}
              placeholder='Size'
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <Icon icon='mdi:ruler' />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <StyledTextField
              fullWidth
              label='SKU'
              name='sku'
              value={formData.sku}
              onChange={handleChange}
              placeholder='SKU'
              required
              disabled={isEdit}
              helperText={isEdit ? 'SKU cannot be changed' : ''}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <Icon icon='mdi:barcode' />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
        </Grid>

        <Box sx={{ my: 8 }}>
          <SectionTitle>Pricing & Packing</SectionTitle>
          <Grid container spacing={6}>
            <Grid item xs={12} md={6}>
              <StyledTextField
                fullWidth
                label='Pieces / Carton'
                name='cartonConversion'
                type='number'
                value={formData.cartonConversion}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Icon icon='mdi:package-variant' />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <StyledTextField
                fullWidth
                label='Cost / Piece'
                name='costPerPiece'
                type='number'
                value={formData.costPerPiece}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Icon icon='mdi:target' />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <StyledTextField
                fullWidth
                label='Sale Price (Piece)'
                name='pricePerPiece'
                type='number'
                value={formData.pricePerPiece}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Icon icon='mdi:tag-outline' />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <StyledTextField
                fullWidth
                label='Sale Price (Carton)'
                name='pricePerCarton'
                type='number'
                value={formData.pricePerCarton || 0}
                InputProps={{
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Icon icon='mdi:tag-multiple-outline' />
                    </InputAdornment>
                  )
                }}
                sx={{ backgroundColor: alpha('#000', 0.05) }}
              />
            </Grid>
          </Grid>
        </Box>

        <SubmitButton
          fullWidth
          type='submit'
          variant='contained'
        >
          {isEdit ? 'Update Product' : 'Save Product'}
        </SubmitButton>
      </form>
    </FormWrapper>
  )
}

export default ProductForm
