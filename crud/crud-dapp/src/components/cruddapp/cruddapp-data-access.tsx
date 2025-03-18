'use client'

import { getCruddappProgram, getCruddappProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'
import { error } from 'console'

interface CreateEntryArgs {
  title: string;
  message: string;
  owner: PublicKey;
}

export function useCruddappProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getCruddappProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getCruddappProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['cruddapp', 'all', { cluster }],
    queryFn: () => program.account.journalEntryState.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const createEntry = useMutation<string, Error, CreateEntryArgs>({
    mutationKey: [`journalEntry`, `create`, {cluster}],
    mutationFn: async ({title,message}) => {
      return program.methods.createJournalEntry(title,message).rpc();
    },
    onSuccess: (signature)=> {
      transactionToast(signature);
      accounts.refetch()
    },
    onError: (error) => {
      toast.error(`Error in creation of Entry ${error.message}`)
    }
  })
  

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    createEntry
   
  }
}

export function useCruddappProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useCruddappProgram()

  const accountQuery = useQuery({
    queryKey: ['cruddapp', 'fetch', { cluster, account }],
    queryFn: () => program.account.journalEntryState.fetch(account),
  })

  const updateEntry = useMutation<string, Error, CreateEntryArgs>({
    mutationKey: [`journalEntry`, `update`, {cluster}],
    mutationFn: async ({title,message}) => {
      return program.methods.updateJournalEntry(title,message).rpc();
    },
    onSuccess: (signature)=> {
      transactionToast(signature);
      accounts.refetch()
    },
    onError: (error) => {
      toast.error(`Error in creation of Entry ${error.message}`)
    }
  })

  const deleteEntry = useMutation({
    mutationKey: ["journalEntry", "delete", { cluster, account}],
    mutationFn: (title: string) =>{
    return  program.methods.deleteJournalEntry(title).rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      accounts.refetch();
    },
  });
  
  return {
    accountQuery,
    updateEntry,
    deleteEntry
  }
 
}
