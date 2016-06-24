class CreateEquipment < ActiveRecord::Migration
  def change
    create_table :equipment do |t|
      t.references :repository, index: true, foreign_key: true
      t.string :name

      t.timestamps null: false
    end
  end
end
