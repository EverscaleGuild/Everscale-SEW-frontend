import * as React from 'react';
import FormControl from '@mui/material/FormControl';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
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

function contractAddress(network: string, name = "App"): Address {
  // @ts-ignore
  return new Address(addr[network][name])
}

async function Contract() {
  const providerState = await ever.getProviderState();
  const address = contractAddress(providerState.selectedConnection);
  return new ever.Contract(abi, address);
}

// modal
const box_style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 200,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const button_style = {
  top: 20, 
  backgroundColor: '#39f491',
  '&:hover': {
    boxShadow: '0px 0px 5px 2px rgb(57 244 145)',
    backgroundColor: '#39f491',
  },  
}

const wallets = [
  {
    name: "everscale",
    disabled: false,
  },
  {
    name: "metamask",
    disabled: true,
  }
]

interface ICreateBetProps {
  getList: any;
}

export const CreateBet: React.FC<ICreateBetProps> = (props) => {
    // modal
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const {getList} = props;
    const [wallet, setWallet] = React.useState('everscale');
    const [hasWallet, ifHasWallet] = React.useState(false);
    const [betName, setBetName] = React.useState('');
    const [betValue, setBetValue] = React.useState('');
    const [randomNumber, setNumberValue] = React.useState(0);
    const [loading, setLoading] = React.useState(false);

    const handleWalletChange = (event: SelectChangeEvent) => {
      let walletName = event.target.value.toLowerCase();
      setWallet(walletName);
    };

    const AuthWallet = () => {
      if(wallet === 'everscale' && getEverscaleWallet() !== null) {
        ifHasWallet(true);
      } else {
        ifHasWallet(false)
      }
    }


    const getBetName = (event: {target: {value: string}}) => {
      setBetName(event.target.value);
    };

    const getBetValue = (event: {target: {value: string}}) => {
      setBetValue(event.target.value);
    };

    const getRandomNumber = (event: any) => {
      setNumberValue(event.target.value);
    };

    const getHashAndSave = async () => {
      const output = await (await Contract())
        .methods
        .createHash({
          nameOption: betName,
          notice: randomNumber
        })
        .call();
      localStorage.setItem('hash', output.hash);
      return output.hash;
    };

    const makeBet = async () => {
      const hash = await getHashAndSave();
      localStorage.setItem('secret', `${betName} ${randomNumber}`);
      const selectedAddress = await getEverscaleWallet()
      setLoading(true);
      const output = await (await Contract())
        .methods
        .bet({
          betHash: hash,
          amount: ((Number(betValue) + 1) * Math.pow(10, 9)).toString(),
        })
        .send({
            from: selectedAddress.address,
            amount: ((Number(betValue) + 1) * Math.pow(10, 9)).toString(),
            bounce: true,
          }).then(() => {
            setLoading(false);
            getList();
          });
    };

    return (
        <div>
          <IconButton sx={button_style} onClick={handleOpen} color="primary" aria-label="add">
              <AddIcon />
          </IconButton>

          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={box_style}>
            {!hasWallet ? (<FormControl>
              <FormLabel id="demo-radio-buttons-group-label" sx={{ mb: 2 }}>Choose wallet</FormLabel>
              <RadioGroup
                aria-labelledby="demo-radio-buttons-group-label"
                value={wallet}
                name="radio-buttons-group"
                onChange={handleWalletChange}
              >
                {wallets.map((item) => (
                  <FormControlLabel value={item.name} control={<Radio />} label={item.name} key={item.name} disabled={item.disabled}/>
                ))}
              </RadioGroup>
              <Button variant="contained" sx={{ mt: 2 }} onClick={AuthWallet}>Confirm</Button>
            </FormControl>
            ) : (
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-standard-label">Choose your bet</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={betName}
                  label="Choose your bet"
                  sx={{ mt: 1 }}
                  onChange={getBetName}
                >
                  <MenuItem value="E">Rock</MenuItem>
                  <MenuItem value="W">Paper</MenuItem>
                  <MenuItem value="S">Scissors</MenuItem>
                </Select>
                <TextField 
                  id="bet-value" 
                  label="Bet value (EVER)" 
                  variant="outlined"  
                  sx={{ mt: 2 }} 
                  value={betValue}
                  onChange={getBetValue}
                />
                <TextField
                  id="random-number"
                  label="Random number"
                  type="number"
                  sx={{ mt: 2 }}
                  value={randomNumber}
                  onChange={getRandomNumber}
                />
                <Button variant="contained" sx={{ mt: 2 }} onClick={makeBet}>Make a bet</Button>
                {loading ? (<Box sx={{ display: 'flex', justifyContent: 'center', mt: 1}}>
                  <CircularProgress />
                </Box>) : ''}
              </FormControl>
            )}
            </Box>
          </Modal>
        </div>
    );
}
