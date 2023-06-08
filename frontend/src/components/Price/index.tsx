import Spinner from '../Spinner';

interface PriceProps {
    amount: bigint | null,
    decimals: number | null
}

const Price = ({ amount, decimals }: PriceProps) => (
    <span>{ (!amount || !decimals) ? <Spinner /> : '$' + (Number(amount) / 10 ** Number(decimals)) }</span>
);

export default Price;