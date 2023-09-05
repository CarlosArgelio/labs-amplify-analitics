import { ModelInit, MutableModel, __modelMeta__, ManagedIdentifier } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled } from "@aws-amplify/datastore";





type EagerDeal = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Deal, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyDeal = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Deal, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Deal = LazyLoading extends LazyLoadingDisabled ? EagerDeal : LazyDeal

export declare const Deal: (new (init: ModelInit<Deal>) => Deal) & {
  copyOf(source: Deal, mutator: (draft: MutableModel<Deal>) => MutableModel<Deal> | void): Deal;
}