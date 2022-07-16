import * as React from 'react';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';

import { Stone } from './hands/Stone'
import { Paper } from './hands/Paper'
import { Scissors } from './hands/Scissors'
import { Secret } from './hands/Secret'
import { abi, addr } from '../Contract';
import { 
  Address, 
  ProviderRpcClient
} from 'everscale-inpage-provider';

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80vw',
    height: '80vh',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

interface IGameProps {
    game: {
      0: string,
      1: {hash: string, amount: string}
    };
    handleClose: () => void;
}


const ever = new ProviderRpcClient();

function contractAddress(network: string, name = "App"): Address {
  // @ts-ignore
  return new Address(addr[network][name])
}

async function Contract() {
  const providerState = await ever.getProviderState();
  const address = contractAddress(providerState.selectedConnection);
  return new ever.Contract(abi, address);
}

export const Game: React.FC<IGameProps> = (props) => {
    const { game, handleClose } = props;
    const [secret, setSecret] = React.useState<boolean | null>(null)
    const [choosed, setChoosed] = React.useState<string>('')
    const handleChoose = (hand: string) => {
        setChoosed(hand);
        setSecret(true);
    }
    const isShowStone = choosed === null || choosed === 'E';
    const isShowPaper = choosed === null || choosed === 'W';
    const isShowScissors = choosed === null || choosed === 'S';

    const hands = [Stone, Paper, Scissors];
    const RandomHand = () => <img src={`${process.env.PUBLIC_URL}/timer.gif`} width='90%'/>;

    const makeBeat = async () => {
        const { accountInteraction } = await ever.requestPermissions({
          permissions: ['basic', 'accountInteraction'],
        });
        if (accountInteraction == null) {
          throw new Error('Insufficient permissions');
        }
        const userAddress = accountInteraction.address;
        const output = await (await Contract())
          .methods
          .beat({
            betId: game[1].hash,
            chose: choosed,
          })
          .send({
              from: userAddress,
              amount: game[1].amount,
            })
            // .then(() => {
            //   setLoading(false);
            //   getList();
            // });
          console.log(output);
    }
    return (
        <Box>
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                open={!!game[1].hash}
                onClose={handleClose}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}
            >
                <Fade in={!!game[1].hash}>
                    <Box sx={style}>
                        <Box sx={{ position: 'absolute', bottom: 30, left: 100, transform: 'rotate(20deg)' }} >
                            {isShowStone && <Stone style={{ fill: 'antiquewhite' }} onClick={() => handleChoose('E')} />}
                        </Box>
                        <Box sx={{ position: 'absolute', bottom: 30, right: 100, transform: 'rotate(-20deg)' }}>
                            {isShowPaper && <Paper style={{ fill: 'antiquewhite' }} onClick={() => handleChoose('W')} />}
                        </Box>
                        <Box sx={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)' }}>
                            {isShowScissors && <Scissors style={{ fill: 'antiquewhite' }} onClick={() => handleChoose('S')} />}
                        </Box>
                        <Box sx={{ position: 'absolute', top: 30, left: '50%', transform: 'translateX(-50%)' }}>
                            {!secret ?
                                <Secret style={{ fill: 'antiquewhite' }} /> :
                                <RandomHand />
                            }
                        </Box>
                        {/* <Box sx={{ position: 'absolute', top: 50, left: 200, transform: 'translateX(-50%)' }}>
                            <img src="https://mui.com/static/images/cards/contemplative-reptile.jpg" height={140} alt="nft" />
                        </Box>
                        <Box sx={{ position: 'absolute', top: 200, left: 200, transform: 'translateX(-50%)' }}>
                            <Typography
                                variant="h2"
                            >
                                200 ₽
                            </Typography>
                        </Box> */}
                    </Box>
                </Fade>
            </Modal>
        </Box>
    );
}
