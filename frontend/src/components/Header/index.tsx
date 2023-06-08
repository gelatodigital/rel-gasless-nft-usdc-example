import { ReactComponent as Flagship } from '../../icons/flagship.svg';
import './style.css';

const Header = () => (
  <header>
    <a href='https://www.gelato.network/' className='logo'><Flagship/></a>
    <div className='links'>
      <a href='https://www.gelato.network/blog'>Blog</a>
      <a href='https://github.com/gelatodigital'>GitHub</a>
      <a href='https://docs.gelato.network/developer-services/relay'>Documentation</a>
    </div>
  </header>
);

export default Header;