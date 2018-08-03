class AddNameEmailClientAreaToProjectProposals < ActiveRecord::Migration
  def change
    add_column :project_proposals, :username, :string
    add_column :project_proposals, :email, :string
    add_column :project_proposals, :client, :string
    add_column :project_proposals, :area, :string
  end
end
