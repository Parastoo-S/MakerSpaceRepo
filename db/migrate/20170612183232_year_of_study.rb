class YearOfStudy < ActiveRecord::Migration
  def change
  	add_column :users, :year_of_study, :string
  end
end
