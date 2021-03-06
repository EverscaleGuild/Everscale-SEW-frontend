import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { useNavigate } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import "./header.css"
import {
  Address,
  ProviderRpcClient
} from 'everscale-inpage-provider';
import { abi, addr } from '../Contract';

const ever = new ProviderRpcClient();

const getEverscaleWallet = async function() {

  if (!(await ever.hasProvider())) {
    throw new Error('Extension is not installed');
  }

  const { accountInteraction } = await ever.requestPermissions({
    permissions: ['basic', 'accountInteraction'],
  });

  if (accountInteraction == null) {
    throw new Error('Insufficient permissions');
  }

  return accountInteraction;
}



const settings = [
    // 'Profile',
    // 'Account',
    // 'Dashboard',
    'Logout',
];


async function disconnectAction() {
    console.log('disconnectAction')
    await ever.disconnect();
    document.location.reload()
}

//const makeBet = async function (){
  //const selectedAddress = await getEverscaleWallet() selectedAddress.address.toString()
//};
//const user = "a"

export const Header = () => {
    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        disconnectAction()
    };

    const navigate = useNavigate();



    return (
        <AppBar position="static">
            <Container maxWidth="xl">
                <Toolbar disableGutters>

                    <img src= "logo.jpeg" alt="logo" style={{height: '40px'}}/>

                    <Typography sx={{position: "absolute", left: 100}}>Slashing, EVER, Whitepaper</Typography>

                    <Box sx={{ flexGrow: 0, position: 'absolute', right: 10 }}>
                        <Tooltip title="Profile">
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                <Avatar alt="Remy Sharp" src={`https://avatars.dicebear.com/api/pixel-art/d.svg`} />
                            </IconButton>
                        </Tooltip>
                        <Menu
                            sx={{ mt: '45px' }}
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                        >
                            {settings.map((setting) => (
                                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                                    <Typography textAlign="center">{setting}</Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};
