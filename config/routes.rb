Rails.application.routes.draw do
  devise_for :users, controllers: { omniauth_callbacks: 'users/omniauth_callbacks' }
  root "items#index"
  resources :items, only: [:new, :create] do
    member do
      get :buy
    end
  end
  resources :user_profiles, only: [:edit,:update]
  resources :users, only: [:index]
  resources :items, only: [:index, :show, :new, :create, :edit, :update] do
    collection do
      get :category
      get :search
    end
  end
  resources :addresses, only: [:new, :create, :edit, :update]
  resources :users  do
    collection do
      get :logout
      get :card
    end
  end
  resources :item_images, only: [:destroy]
  resources :categories, only: [:show]
  resources :brands, only: [:show]
end
