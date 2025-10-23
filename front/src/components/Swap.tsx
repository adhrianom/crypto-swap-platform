import React, { useState, useEffect } from 'react';
import { Input, Popover, Radio, Modal } from 'antd';
import {
  ArrowDownOutlined,
  DownOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import tokenList from '../../tokenList.json';
import axios from 'axios';
import type { RadioChangeEvent } from 'antd';
import { useSendTransaction, useWaitForTransaction } from 'wagmi';

type SwapProps = {
  isConnected: boolean;
  address?: string;
};

type Token = {
  address: string;
  img: string;
  name: string;
  ticker: string;
};

type Prices = {
  ratio: number;
};

function Swap(props: SwapProps) {
  const { isConnected, address } = props;
  const [slippage, setSlippage] = useState<number>(2.5);
  const [tokenOneAmount, setTokenOneAmount] = useState<string | null>(null);
  const [tokenTwoAmount, setTokenTwoAmount] = useState<string | null>(null);
  const [tokenOne, setTokenOne] = useState<Token>(tokenList[0]);
  const [tokenTwo, setTokenTwo] = useState<Token>(tokenList[1]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [changeToken, setChangeToken] = useState<number>(1);
  const [prices, setPrices] = useState<Prices | null>(null);
  const [txDetails, setTxDetails] = useState({
    to: null,
    data: null,
    value: null,
  });

  const { data, sendTransaction } = useSendTransaction({
    request: {
      to: String(txDetails.to),
      data: String(txDetails.data),
      value: txDetails.value,
    },
  });

  function handleSlippageChange(e: RadioChangeEvent) {
    setSlippage(e.target.value);
  }

  function changeAmount(e: React.ChangeEvent<HTMLInputElement>) {
    setTokenOneAmount(e.target.value);
    if (e.target.value && prices) {
      setTokenTwoAmount((parseFloat(e.target.value) * prices.ratio).toFixed(2));
    } else {
      setTokenTwoAmount(null);
    }
  }

  function switchTokens() {
    setPrices(null);
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
    const one = tokenOne;
    const two = tokenTwo;
    setTokenOne(two);
    setTokenTwo(one);
    fetchPrices(two.address, one.address);
  }

  function openModal(asset: number) {
    setChangeToken(asset);
    setIsOpen(true);
  }

  function modifyToken(i: number) {
    setPrices(null);
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
    if (changeToken === 1) {
      setTokenOne(tokenList[i]);
      fetchPrices(tokenList[i].address, tokenTwo.address);
    } else {
      setTokenTwo(tokenList[i]);
      fetchPrices(tokenOne.address, tokenList[i].address);
    }

    setIsOpen(false);
  }

  async function fetchPrices(one: string, two: string) {
    const res = await axios.get(`http://localhost:3001/tokenPrice`, {
      params: { addressOne: one, addressTwo: two },
    });
    console.log(res.data);
    setPrices(res.data);
  }

  async function fetchDexSwap() {}

  useEffect(() => {
    fetchPrices(tokenList[0].address, tokenList[1].address);
  }, []);

  useEffect(() => {
    if (txDetails.to && isConnected) {
      sendTransaction();
    }
  }, [txDetails]);

  const settings = (
    <>
      <div>Slippage Tolerance</div>

      <div>
        <Radio.Group value={slippage} onChange={handleSlippageChange}>
          <Radio.Button value={0.5}>0.5%</Radio.Button>
          <Radio.Button value={2.5}>2.5%</Radio.Button>
          <Radio.Button value={5}>5%</Radio.Button>
        </Radio.Group>
      </div>
    </>
  );

  return (
    <>
      <Modal
        open={isOpen}
        footer={null}
        onCancel={() => setIsOpen(false)}
        title="Select a token"
      >
        <div className="modalContent">
          {tokenList?.map((e: Token, i: number) => {
            return (
              <div
                className="tokenChoice"
                key={i}
                onClick={() => modifyToken(i)}
              >
                <img src={e.img} alt={e.ticker} className="tokenLogo" />
                <div className="tokenChoiceNames">
                  <div className="tokenName">{e.name}</div>
                  <div className="tokenTicker">{e.ticker}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
      <div className="tradeBox">
        <div className="tradeBoxHeader">
          <h4>Swap</h4>
          <Popover
            content={settings}
            title="Settings"
            trigger="click"
            placement="bottomRight"
          >
            <SettingOutlined className="cog" />
          </Popover>
        </div>
        <div className="inputs">
          <Input
            placeholder="0"
            value={tokenOneAmount ?? ''}
            onChange={changeAmount}
            disabled={!prices}
          />
          <Input placeholder="0" value={tokenTwoAmount ?? ''} disabled={true} />
          <div className="switchButton" onClick={switchTokens}>
            <ArrowDownOutlined className="switchArrow" />
          </div>
          <div className="assetOne" onClick={() => openModal(1)}>
            <img src={tokenOne.img} alt="assetOneLogo" className="assetLogo" />
            {tokenOne.ticker}
            <DownOutlined />
          </div>
          <div className="assetTwo" onClick={() => openModal(2)}>
            <img src={tokenTwo.img} alt="assetTwoLogo" className="assetLogo" />
            {tokenTwo.ticker}
            <DownOutlined />
          </div>
        </div>
        <button
          className="swapButton"
          disabled={!tokenOneAmount || !isConnected}
        >
          Swap
        </button>
      </div>
    </>
  );
}

export default Swap;
