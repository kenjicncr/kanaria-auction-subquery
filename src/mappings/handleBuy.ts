import { BoughtSlot  } from '../types'
import { MoonbeamCall, MoonbeamEvent } from '@subql/contract-processors/dist/moonbeam';

type BuyArgs = Array<{
   _kanariaId: string;
  _note: string;
}>

export async function handleBuy(event: MoonbeamCall<BuyArgs>): Promise<void> {
  const id = `${event.hash}`
  const { success } = event
  const { _kanariaId, _note } = event.args[0]
  if(!success) return
  // const price = event.args[0].price?.toBigInt()
  let boughtSlot = await BoughtSlot.get(id)

  if(!boughtSlot) {
    boughtSlot = new BoughtSlot(id)
    boughtSlot.itemId = _kanariaId
    boughtSlot.note = _note
    await boughtSlot.save()
  } else {
    boughtSlot.itemId = _kanariaId
    boughtSlot.note = _note
    await boughtSlot.save()
  }
}

type ItemBought = [{
  address: string;
  itemId: BigInt;
  price: BigInt;
}]

export async function handleBought(event: MoonbeamEvent<ItemBought>) {
  const txHash = `${event.transactionHash}`
  const { address, itemId, price } =  event.args[0]

  let boughtSlot = await BoughtSlot.get(txHash)

  if(!boughtSlot) {
    boughtSlot = new BoughtSlot(txHash)
    boughtSlot.price = BigInt(price.toString())
    boughtSlot.slotId = itemId.toString()
    boughtSlot.purchaser = address
    boughtSlot.timeBought = BigInt(event.blockTimestamp.toString())
    await boughtSlot.save()
  }
}