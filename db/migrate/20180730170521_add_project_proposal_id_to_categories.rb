class AddProjectProposalIdToCategories < ActiveRecord::Migration
  def change
    add_column :categories, :project_proposal_id, :integer
  end
end
