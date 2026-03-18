import { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  Typography,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Button,
  CircularProgress,
  Dialog,
  Fab
} from '@mui/material'
import { styled, alpha } from '@mui/material/styles'
import NextLink from 'next/link'
import Icon from 'src/@core/components/icon'
import axios from 'src/api/axiosInstance'
import toast from 'react-hot-toast'

// ** Internal Component Imports
import ProductForm from 'src/views/products/ProductForm'

const PageWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(6),
  backgroundColor: theme.palette.background.default,
  minHeight: '100vh'
}))

const HeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  marginBottom: theme.spacing(6)
}))

const SearchWrapper = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius * 2,
    backgroundColor: theme.palette.background.paper,
    transition: theme.transitions.create(['box-shadow', 'border-color']),
    '&:hover': {
      boxShadow: theme.shadows[2]
    },
    '&.Mui-focused': {
      boxShadow: theme.shadows[3]
    }
  },
  marginBottom: theme.spacing(8)
}))

const ProductCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  padding: theme.spacing(4, 6),
  display: 'flex',
  alignItems: 'center',
  borderRadius: theme.shape.borderRadius * 2,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: 'none',
  transition: theme.transitions.create(['box-shadow', 'transform']),
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-2px)'
  }
}))

const ProductAvatar = styled(Avatar)(({ theme, avatarcolor }) => ({
  width: 56,
  height: 56,
  fontSize: '1.5rem',
  fontWeight: 700,
  marginRight: theme.spacing(6),
  backgroundColor: avatarcolor || theme.palette.primary.main,
  boxShadow: `0 4px 12px 0 ${alpha(avatarcolor || theme.palette.primary.main, 0.4)}`
}))

const PriceTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  '& span': {
    color: theme.palette.info.main,
    marginLeft: theme.spacing(1)
  }
}))

const ActionButton = styled(IconButton)(({ theme, colorType }) => ({
  backgroundColor: alpha(theme.palette[colorType].main, 0.08),
  color: theme.palette[colorType].main,
  margin: theme.spacing(0, 1),
  '&:hover': {
    backgroundColor: alpha(theme.palette[colorType].main, 0.15)
  }
}))

const AddProductFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(8),
  right: theme.spacing(8),
  backgroundColor: theme.palette.info.main,
  color: theme.palette.common.white,
  textTransform: 'none',
  paddingLeft: theme.spacing(4),
  paddingRight: theme.spacing(6),
  borderRadius: theme.shape.borderRadius * 2,
  '&:hover': {
    backgroundColor: theme.palette.info.dark
  }
}))

const ProductManagement = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [openForm, setOpenForm] = useState(false)
  const [isEdit, setIsEdit] = useState(false)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/products', { params: { limit: 100 } })
      if (response.data.success) {
        // The backend returns { products, total, page, pages }
        setProducts(Array.isArray(response.data.data.products) ? response.data.data.products : [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await axios.delete(`/api/products/${id}`)
        if (response.data.success) {
          toast.success('Product deleted successfully')
          fetchProducts()
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete product')
      }
    }
  }

  const handleEdit = (product) => {
    setSelectedProduct(product)
    setIsEdit(true)
    setOpenForm(true)
  }

  const handleAdd = () => {
    setSelectedProduct(null)
    setIsEdit(false)
    setOpenForm(true)
  }

  const filteredProducts = Array.isArray(products) ? products.filter(product => {
    const query = searchQuery.toLowerCase()
    return (
      product.productName?.toLowerCase().includes(query) ||
      product.sku?.toLowerCase().includes(query) ||
      product.variant?.toLowerCase().includes(query)
    )
  }) : []

  // Colors based on variant/name for the avatar
  const getAvatarColor = (name) => {
    const colors = ['#FF9800', '#03A9F4', '#4CAF50', '#E91E63', '#9C27B0', '#00BCD4']
    const index = name?.length % colors.length
    return colors[index]
  }

  return (
    <PageWrapper>
      <HeaderBox>
        <IconButton component={NextLink} href='/menu' sx={{ position: 'absolute', left: 0 }}>
          <Icon icon='mdi:arrow-left' />
        </IconButton>
        <Typography variant='h5' sx={{ fontWeight: 600 }}>Product Management</Typography>
      </HeaderBox>

      <SearchWrapper
        fullWidth
        placeholder='Search by name, SKU, or variant'
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <Icon icon='mdi:magnify' />
            </InputAdornment>
          )
        }}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container>
          {filteredProducts.map((product) => (
            <Grid item xs={12} key={product._id}>
              <ProductCard>
                <ProductAvatar avatarcolor={getAvatarColor(product.productName)}>
                  {product.variant ? product.variant.charAt(0).toUpperCase() : (product.productName ? product.productName.charAt(0).toUpperCase() : 'P')}
                </ProductAvatar>
                
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant='h6' sx={{ fontWeight: 700, mb: 0.5 }}>{product.productName}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                      <Icon icon='mdi:barcode' fontSize='1rem' style={{ marginRight: 4 }} />
                      <Typography variant='body2'>{product.sku}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                      <Icon icon='mdi:package-variant' fontSize='1rem' style={{ marginRight: 4 }} />
                      <Typography variant='body2'>{product.size}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 6 }}>
                    <PriceTypography variant='body2'>
                      PIECE: <span>Rs {product.pricePerPiece}</span>
                    </PriceTypography>
                    <PriceTypography variant='body2'>
                      CARTON: <span>Rs {product.pricePerCarton}</span>
                    </PriceTypography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                  <Chip 
                    label={product.variant} 
                    size='small' 
                    sx={{ backgroundColor: alpha(getAvatarColor(product.productName), 0.1), color: getAvatarColor(product.productName), fontWeight: 600, borderRadius: 1 }} 
                  />
                  <Box sx={{ display: 'flex' }}>
                    <ActionButton colorType='secondary' onClick={() => handleEdit(product)}>
                      <Icon icon='mdi:pencil-outline' fontSize='1.2rem' />
                    </ActionButton>
                    <ActionButton colorType='error' onClick={() => handleDelete(product._id)}>
                      <Icon icon='mdi:trash-can-outline' fontSize='1.2rem' />
                    </ActionButton>
                  </Box>
                </Box>
              </ProductCard>
            </Grid>
          ))}
        </Grid>
      )}

      <AddProductFab color='primary' variant='extended' onClick={handleAdd}>
        <Icon icon='mdi:plus' style={{ marginRight: 8 }} />
        Add Product
      </AddProductFab>

      <Dialog 
        open={openForm} 
        onClose={() => setOpenForm(false)}
        maxWidth='md'
        fullWidth
        scroll='body'
      >
        <ProductForm 
          product={selectedProduct} 
          isEdit={isEdit}
          onClose={() => {
            setOpenForm(false)
            fetchProducts()
          }} 
        />
      </Dialog>
    </PageWrapper>
  )
}

export default ProductManagement

