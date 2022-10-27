import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { MostVoted } from './recipes/MostVoted';
import { Recientes } from './recipes/Recientes';
import { EnVivo } from './recipes/EnVivo';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography component={'div'}>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}
export const Dashboard = () => {
    const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
    
    return (
      <>
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
              <Tab label="Más Votos" {...a11yProps(0)} />
              <Tab label="Recientes" {...a11yProps(1)} />
              <Tab label="En Vivo" {...a11yProps(2)} />
            </Tabs>
          </Box>
          <TabPanel value={value} index={0}>
            <div className='d-flex flex-wrap'>
                <MostVoted/>
            </div>
          </TabPanel>
          <TabPanel value={value} index={1}>
            <div className='d-flex flex-wrap'>
              <Recientes/>
            </div>
          </TabPanel>
          <TabPanel value={value} index={2}>
            <div className='d-flex flex-wrap'>
              <EnVivo/>
            </div>
          </TabPanel>
        </Box>
      </>
    )
}