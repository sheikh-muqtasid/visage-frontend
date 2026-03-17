import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

const Ledger = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Ledger' />
          <CardContent>
            <Typography>Customer Ledger and Account Balance details will appear here.</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default Ledger
